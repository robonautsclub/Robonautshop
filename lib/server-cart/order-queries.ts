import { and, eq } from "drizzle-orm";

import { getProductById } from "@/lib/catalog/queries";
import { getAvailableQuantity } from "@/lib/catalog/types";
import { estimateShippingBdt, type PaymentMethodId } from "@/lib/checkout/types";
import type { Database } from "@/lib/db";
import { bkashPendingPayments } from "@/lib/db/schema/bkash-pending-payments";
import { orderItems } from "@/lib/db/schema/order-items";
import { orders } from "@/lib/db/schema/orders";
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

async function insertPaidOrCodOrder(
  db: Database,
  args: {
    orderId: string;
    userId: string;
    paymentMethod: PaymentMethodId;
    status: "PENDING" | "PAID";
    paymentStatus: "PENDING" | "PAID";
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

/**
 * Creates a real order from the signed-in user's server cart — never from
 * line items the client reports directly (AGENTS.md "Pricing").
 *
 * COD / Nagad: insert order immediately (`PENDING`), clear cart.
 * BKASH: do **not** insert an order until payment completes. Stage a
 * `bkash_pending_payments` row, redirect to bKash; cart stays until Execute
 * succeeds in the callback.
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

      // Cart and orders table stay untouched until payment succeeds.
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

  await insertPaidOrCodOrder(db, {
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

  await clearServerCart(db, userId);

  return { ok: true, orderId };
}

/**
 * After bKash Execute Payment succeeds: write the real PAID order from the
 * staged pending payload, clear the cart, remove the pending row.
 */
export async function finalizeBkashPaidOrder(
  db: Database,
  paymentId: string,
  trxID: string,
): Promise<{ orderId: string } | { error: string }> {
  const existing = await getOrderByBkashPaymentId(db, paymentId);
  if (existing) {
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

  await insertPaidOrCodOrder(db, {
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

  await clearServerCart(db, pending.userId);
  await db.delete(bkashPendingPayments).where(eq(bkashPendingPayments.id, pending.id));

  return { orderId: pending.id };
}

/** Drop a staged bKash checkout (cancel / failure) — cart stays as-is. */
export async function discardBkashPendingPayment(
  db: Database,
  paymentId: string,
): Promise<void> {
  await db
    .delete(bkashPendingPayments)
    .where(eq(bkashPendingPayments.paymentId, paymentId));
}

export type OrderRecord = typeof orders.$inferSelect;
export type OrderItemRecord = typeof orderItems.$inferSelect;

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

/** Look up a completed order by bKash paymentID. */
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
