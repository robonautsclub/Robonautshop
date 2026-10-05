import { and, desc, eq, inArray } from "drizzle-orm";

import { upsertShippingAddressForUser } from "@/lib/account/address-queries";
import { getProductById } from "@/lib/catalog/queries";
import { getAvailableQuantity } from "@/lib/catalog/types";
import { estimateShippingBdt, type PaymentMethodId } from "@/lib/checkout/types";
import type { Database } from "@/lib/db";
import { bkashPendingPayments } from "@/lib/db/schema/bkash-pending-payments";
import { orderItems } from "@/lib/db/schema/order-items";
import { orders } from "@/lib/db/schema/orders";
import type { OrderPaymentStatus, OrderStatus } from "@/lib/db/schema/shared";
import { users } from "@/lib/db/schema/users";
import { sendOrderConfirmationEmail } from "@/lib/email/send";
import {
  BkashApiError,
  createBkashCheckoutPayment,
} from "@/lib/payments/bkash";
import type { BkashPendingPayload } from "@/lib/payments/bkash/pending-payload";
import { parseBkashPendingPayload } from "@/lib/payments/bkash/pending-payload";
import { clearServerCart, getServerCartLines } from "@/lib/server-cart/queries";

export type PlaceOrderAddressInput = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
};

export type PlaceOrderInput = {
  address: PlaceOrderAddressInput;
  location?: { lat: number; lng: number } | null;
  paymentMethod: PaymentMethodId;
  specialInstructions?: string;
};

export type PlaceOrderResult =
  | { ok: true; orderId: string; redirectUrl?: undefined }
  | { ok: true; orderId?: undefined; redirectUrl: string }
  | { ok: false; error: string };

export type RepayBkashResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string };

export type OrderRecord = typeof orders.$inferSelect;
export type OrderItemRecord = typeof orderItems.$inferSelect;

export type CustomerOrderSummary = {
  order: OrderRecord;
  items: OrderItemRecord[];
};

type ValidatedLine = {
  productId: string;
  variantId: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

async function validateCartLines(
  db: Database,
  userId: string,
): Promise<
  | { ok: true; lines: ValidatedLine[]; subtotal: number }
  | { ok: false; error: string }
> {
  const cartLines = await getServerCartLines(db, userId);

  if (cartLines.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const validatedLines: ValidatedLine[] = [];

  for (const line of cartLines) {
    const product = await getProductById(db, line.productId);

    if (!product || product.status !== "PUBLISHED") {
      continue;
    }

    const variant = line.variantId
      ? (product.variants.find((item) => item.id === line.variantId) ?? null)
      : null;

    if (line.variantId && !variant) {
      continue;
    }

    const inventoryRow = variant
      ? (product.inventory.find((row) => row.variantId === variant.id) ?? null)
      : (product.inventory.find((row) => row.variantId === null) ??
        product.inventory[0] ??
        null);

    const availableQuantity = inventoryRow
      ? getAvailableQuantity(inventoryRow)
      : product.inventory.reduce((sum, row) => sum + getAvailableQuantity(row), 0);

    const quantity = Math.min(line.quantity, availableQuantity);

    if (quantity <= 0) {
      continue;
    }

    const unitPrice = variant?.price ?? product.price;

    validatedLines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      productName: variant ? `${product.name} · ${variant.name}` : product.name,
      sku: variant?.sku ?? product.sku,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    });
  }

  if (validatedLines.length === 0) {
    return {
      ok: false,
      error: "None of the items in your cart are currently available.",
    };
  }

  const subtotal = validatedLines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { ok: true, lines: validatedLines, subtotal };
}

async function insertOrderWithItems(
  db: Database,
  args: {
    orderId: string;
    userId: string;
    paymentMethod: PaymentMethodId;
    status: OrderStatus;
    paymentStatus: OrderPaymentStatus;
    lines: ValidatedLine[];
    subtotal: number;
    shippingTotal: number;
    total: number;
    address: PlaceOrderAddressInput;
    location?: { lat: number; lng: number } | null;
    specialInstructions?: string;
    bkashPaymentId?: string | null;
    bkashTransactionId?: string | null;
  },
): Promise<void> {
  const now = new Date().toISOString();

  await db.insert(orders).values({
    id: args.orderId,
    userId: args.userId,
    status: args.status,
    paymentStatus: args.paymentStatus,
    paymentMethod: args.paymentMethod,
    subtotal: args.subtotal,
    shippingTotal: args.shippingTotal,
    total: args.total,
    shippingFullName: args.address.fullName,
    shippingPhone: args.address.phone,
    shippingAddressLine1: args.address.addressLine1,
    shippingAddressLine2: args.address.addressLine2 ?? null,
    shippingCity: args.address.city,
    shippingPostalCode: args.address.postalCode ?? null,
    shippingLat: args.location?.lat ?? null,
    shippingLng: args.location?.lng ?? null,
    specialInstructions: args.specialInstructions?.trim() || null,
    bkashPaymentId: args.bkashPaymentId ?? null,
    bkashTransactionId: args.bkashTransactionId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(orderItems).values(
    args.lines.map((line) => ({
      id: crypto.randomUUID(),
      orderId: args.orderId,
      productId: line.productId,
      variantId: line.variantId,
      productName: line.productName,
      sku: line.sku,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
      createdAt: now,
    })),
  );
}

async function notifyOrderEmail(
  db: Database,
  order: OrderRecord,
  items: OrderItemRecord[],
): Promise<void> {
  const userRows = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, order.userId))
    .limit(1);
  const user = userRows[0];
  if (!user?.email) {
    return;
  }

  await sendOrderConfirmationEmail({
    to: user.email,
    customerName: user.name,
    orderId: order.id,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
    subtotal: order.subtotal,
    shippingTotal: order.shippingTotal,
    total: order.total,
    shippingFullName: order.shippingFullName,
    shippingPhone: order.shippingPhone,
    shippingAddressLine1: order.shippingAddressLine1,
    shippingAddressLine2: order.shippingAddressLine2,
    shippingCity: order.shippingCity,
    shippingPostalCode: order.shippingPostalCode,
    lines: items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
  });
}

/**
 * Creates a real order from the signed-in user's server cart — never from
 * line items the client reports directly (AGENTS.md "Pricing").
 *
 * COD / Nagad: insert order immediately (`PENDING`), clear cart, email.
 * BKASH: stage `bkash_pending_payments`, redirect; cart stays until Execute
 * succeeds or fail/cancel persists a repayable unpaid order.
 */
export async function placeOrderFromServerCart(
  db: Database,
  userId: string,
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const validated = await validateCartLines(db, userId);
  if (!validated.ok) {
    return validated;
  }

  const shipping = estimateShippingBdt(input.address.city);
  const total = validated.subtotal + shipping.amount;

  if (input.paymentMethod === "BKASH") {
    const intendedOrderId = crypto.randomUUID();

    try {
      const payment = await createBkashCheckoutPayment(db, {
        amountBdt: total,
        orderId: intendedOrderId,
        payerReference: input.address.phone,
      });

      const payload: BkashPendingPayload = {
        lines: validated.lines,
        address: input.address,
        location: input.location ?? null,
        specialInstructions: input.specialInstructions,
        subtotal: validated.subtotal,
        shippingTotal: shipping.amount,
        total,
      };

      await db.insert(bkashPendingPayments).values({
        id: intendedOrderId,
        userId,
        paymentId: payment.paymentID,
        payload: JSON.stringify(payload),
        createdAt: new Date().toISOString(),
      });

      return { ok: true, redirectUrl: payment.bkashURL };
    } catch (error) {
      const message =
        error instanceof BkashApiError
          ? error.message
          : "Could not start bKash payment. Please try again.";
      return { ok: false, error: message };
    }
  }

  const orderId = crypto.randomUUID();

  await insertOrderWithItems(db, {
    orderId,
    userId,
    paymentMethod: input.paymentMethod,
    status: "PENDING",
    paymentStatus: "PENDING",
    lines: validated.lines,
    subtotal: validated.subtotal,
    shippingTotal: shipping.amount,
    total,
    address: input.address,
    location: input.location,
    specialInstructions: input.specialInstructions,
  });

  await upsertShippingAddressForUser(db, userId, input.address);
  await clearServerCart(db, userId);

  const placed = await getOrderForCustomer(db, userId, orderId);
  if (placed) {
    await notifyOrderEmail(db, placed.order, placed.items);
  }

  return { ok: true, orderId };
}

/**
 * After bKash Execute Payment succeeds: write the real PAID order from the
 * staged pending payload, clear the cart, remove the pending row.
 * If an unpaid order already exists for this paymentID (repay path), mark it PAID.
 */
export async function finalizeBkashPaidOrder(
  db: Database,
  paymentId: string,
  trxID: string,
): Promise<{ orderId: string } | { error: string }> {
  const existing = await getOrderByBkashPaymentId(db, paymentId);
  if (existing) {
    if (existing.paymentStatus === "PAID") {
      return { orderId: existing.id };
    }

    const now = new Date().toISOString();
    await db
      .update(orders)
      .set({
        status: "PAID",
        paymentStatus: "PAID",
        bkashTransactionId: trxID,
        updatedAt: now,
      })
      .where(eq(orders.id, existing.id));

    await upsertShippingAddressForUser(db, existing.userId, {
      fullName: existing.shippingFullName,
      phone: existing.shippingPhone,
      addressLine1: existing.shippingAddressLine1,
      addressLine2: existing.shippingAddressLine2,
      city: existing.shippingCity,
      postalCode: existing.shippingPostalCode,
    });
    await clearServerCart(db, existing.userId);
    await db
      .delete(bkashPendingPayments)
      .where(eq(bkashPendingPayments.paymentId, paymentId));

    const updated = await getOrderForCustomer(db, existing.userId, existing.id);
    if (updated) {
      await notifyOrderEmail(db, updated.order, updated.items);
    }

    return { orderId: existing.id };
  }

  const pendingRows = await db
    .select()
    .from(bkashPendingPayments)
    .where(eq(bkashPendingPayments.paymentId, paymentId))
    .limit(1);
  const pending = pendingRows[0];

  if (!pending) {
    return { error: "We could not find that bKash payment." };
  }

  let payload: BkashPendingPayload;
  try {
    payload = parseBkashPendingPayload(pending.payload);
  } catch {
    return { error: "Saved checkout details were invalid. Please try again." };
  }

  await insertOrderWithItems(db, {
    orderId: pending.id,
    userId: pending.userId,
    paymentMethod: "BKASH",
    status: "PAID",
    paymentStatus: "PAID",
    lines: payload.lines,
    subtotal: payload.subtotal,
    shippingTotal: payload.shippingTotal,
    total: payload.total,
    address: payload.address,
    location: payload.location,
    specialInstructions: payload.specialInstructions,
    bkashPaymentId: paymentId,
    bkashTransactionId: trxID,
  });

  await upsertShippingAddressForUser(db, pending.userId, payload.address);
  await clearServerCart(db, pending.userId);
  await db.delete(bkashPendingPayments).where(eq(bkashPendingPayments.id, pending.id));

  const placed = await getOrderForCustomer(db, pending.userId, pending.id);
  if (placed) {
    await notifyOrderEmail(db, placed.order, placed.items);
  }

  return { orderId: pending.id };
}

/**
 * Persist a failed/cancelled bKash attempt as an unpaid order so the customer
 * can see it under /account/orders and repay. Cart is cleared — line items
 * live on the order. Address is upserted into the address book.
 */
export async function finalizeBkashUnpaidOrder(
  db: Database,
  paymentId: string,
  paymentStatus: "FAILED" | "CANCELLED",
): Promise<{ orderId: string } | { error: string }> {
  const existing = await getOrderByBkashPaymentId(db, paymentId);
  if (existing) {
    if (existing.paymentStatus === "PAID") {
      return { orderId: existing.id };
    }
    const now = new Date().toISOString();
    await db
      .update(orders)
      .set({
        paymentStatus,
        status: "PAYMENT_PENDING",
        updatedAt: now,
      })
      .where(eq(orders.id, existing.id));
    await db
      .delete(bkashPendingPayments)
      .where(eq(bkashPendingPayments.paymentId, paymentId));
    return { orderId: existing.id };
  }

  const pending = await getBkashPendingByPaymentId(db, paymentId);
  if (!pending) {
    return { error: "We could not find that bKash payment." };
  }

  let payload: BkashPendingPayload;
  try {
    payload = parseBkashPendingPayload(pending.payload);
  } catch {
    return { error: "Saved checkout details were invalid. Please try again." };
  }

  await insertOrderWithItems(db, {
    orderId: pending.id,
    userId: pending.userId,
    paymentMethod: "BKASH",
    status: "PAYMENT_PENDING",
    paymentStatus,
    lines: payload.lines,
    subtotal: payload.subtotal,
    shippingTotal: payload.shippingTotal,
    total: payload.total,
    address: payload.address,
    location: payload.location,
    specialInstructions: payload.specialInstructions,
    bkashPaymentId: paymentId,
    bkashTransactionId: null,
  });

  await upsertShippingAddressForUser(db, pending.userId, payload.address);
  await clearServerCart(db, pending.userId);
  await db.delete(bkashPendingPayments).where(eq(bkashPendingPayments.id, pending.id));

  return { orderId: pending.id };
}

/** @deprecated Prefer finalizeBkashUnpaidOrder — kept for any stray callers. */
export async function discardBkashPendingPayment(
  db: Database,
  paymentId: string,
): Promise<void> {
  await finalizeBkashUnpaidOrder(db, paymentId, "CANCELLED");
}

/**
 * Re-run bKash Create Payment for an unpaid BKASH order after re-validating
 * prices and stock server-side.
 */
export async function repayBkashOrder(
  db: Database,
  userId: string,
  orderId: string,
): Promise<RepayBkashResult> {
  const record = await getOrderForCustomer(db, userId, orderId);
  if (!record) {
    return { ok: false, error: "Order not found." };
  }

  const { order, items } = record;

  if (order.paymentMethod !== "BKASH") {
    return { ok: false, error: "Only bKash orders can be repaid this way." };
  }

  if (order.paymentStatus === "PAID") {
    return { ok: false, error: "This order is already paid." };
  }

  if (
    order.paymentStatus !== "FAILED" &&
    order.paymentStatus !== "CANCELLED" &&
    order.paymentStatus !== "PENDING"
  ) {
    return { ok: false, error: "This order cannot be repaid right now." };
  }

  const revalidated: ValidatedLine[] = [];

  for (const item of items) {
    if (!item.productId) {
      return {
        ok: false,
        error: `“${item.productName}” is no longer in the catalog. Contact support to finish this order.`,
      };
    }

    const product = await getProductById(db, item.productId);
    if (!product || product.status !== "PUBLISHED") {
      return {
        ok: false,
        error: `“${item.productName}” is no longer available.`,
      };
    }

    const variant = item.variantId
      ? (product.variants.find((row) => row.id === item.variantId) ?? null)
      : null;

    if (item.variantId && !variant) {
      return {
        ok: false,
        error: `“${item.productName}” variant is no longer available.`,
      };
    }

    const inventoryRow = variant
      ? (product.inventory.find((row) => row.variantId === variant.id) ?? null)
      : (product.inventory.find((row) => row.variantId === null) ??
        product.inventory[0] ??
        null);

    const availableQuantity = inventoryRow
      ? getAvailableQuantity(inventoryRow)
      : product.inventory.reduce((sum, row) => sum + getAvailableQuantity(row), 0);

    if (availableQuantity < item.quantity) {
      return {
        ok: false,
        error: `Not enough stock for “${item.productName}” (need ${item.quantity}, available ${availableQuantity}).`,
      };
    }

    const unitPrice = variant?.price ?? product.price;
    revalidated.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      productName: variant ? `${product.name} · ${variant.name}` : product.name,
      sku: variant?.sku ?? product.sku,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    });
  }

  const subtotal = revalidated.reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping = estimateShippingBdt(order.shippingCity);
  const total = subtotal + shipping.amount;
  const now = new Date().toISOString();

  try {
    const payment = await createBkashCheckoutPayment(db, {
      amountBdt: total,
      orderId: order.id,
      payerReference: order.shippingPhone,
    });

    await db.delete(orderItems).where(eq(orderItems.orderId, order.id));
    await db.insert(orderItems).values(
      revalidated.map((line) => ({
        id: crypto.randomUUID(),
        orderId: order.id,
        productId: line.productId,
        variantId: line.variantId,
        productName: line.productName,
        sku: line.sku,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
        createdAt: now,
      })),
    );

    await db
      .update(orders)
      .set({
        subtotal,
        shippingTotal: shipping.amount,
        total,
        paymentStatus: "PENDING",
        status: "PAYMENT_PENDING",
        bkashPaymentId: payment.paymentID,
        bkashTransactionId: null,
        updatedAt: now,
      })
      .where(eq(orders.id, order.id));

    // Ensure callback can find this order even if execute lands before update races.
    await db
      .delete(bkashPendingPayments)
      .where(eq(bkashPendingPayments.id, order.id));

    return { ok: true, redirectUrl: payment.bkashURL };
  } catch (error) {
    const message =
      error instanceof BkashApiError
        ? error.message
        : "Could not start bKash payment. Please try again.";
    return { ok: false, error: message };
  }
}

/** Scoped to `userId` so one customer can never read another's order by guessing an id. */
export async function getOrderForCustomer(
  db: Database,
  userId: string,
  orderId: string,
): Promise<{ order: OrderRecord; items: OrderItemRecord[] } | null> {
  const orderRows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));
  const order = orderRows[0];

  if (!order) {
    return null;
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  return { order, items };
}

export async function listOrdersForCustomer(
  db: Database,
  userId: string,
): Promise<CustomerOrderSummary[]> {
  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  if (orderRows.length === 0) {
    return [];
  }

  const orderIds = orderRows.map((row) => row.id);
  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));

  const itemsByOrder = new Map<string, OrderItemRecord[]>();
  for (const item of itemRows) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrder.set(item.orderId, list);
  }

  return orderRows.map((order) => ({
    order,
    items: itemsByOrder.get(order.id) ?? [],
  }));
}

/** Look up a completed or unpaid order by bKash paymentID. */
export async function getOrderByBkashPaymentId(
  db: Database,
  paymentId: string,
): Promise<OrderRecord | null> {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.bkashPaymentId, paymentId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getBkashPendingByPaymentId(
  db: Database,
  paymentId: string,
): Promise<(typeof bkashPendingPayments.$inferSelect) | null> {
  const rows = await db
    .select()
    .from(bkashPendingPayments)
    .where(eq(bkashPendingPayments.paymentId, paymentId))
    .limit(1);
  return rows[0] ?? null;
}
