import { and, eq } from "drizzle-orm";

import { getProductById } from "@/lib/catalog/queries";
import { getAvailableQuantity } from "@/lib/catalog/types";
import { estimateShippingBdt, type PaymentMethodId } from "@/lib/checkout/types";
import type { Database } from "@/lib/db";
import { orderItems } from "@/lib/db/schema/order-items";
import { orders } from "@/lib/db/schema/orders";
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

export type PlaceOrderResult = { ok: true; orderId: string } | { ok: false; error: string };

/**
 * Creates a real order from the signed-in user's server cart — never from
 * line items the client reports directly (AGENTS.md "Pricing": "Never
 * trust client-provided prices"). Every line is re-resolved against the
 * current product/variant/inventory rows in D1; lines for products that
 * are no longer published, or have zero available stock, are silently
 * dropped rather than failing the whole order (stock can legitimately
 * change between "added to cart" and "checked out").
 *
 * `status`/`paymentStatus` start at PENDING — no payment provider is
 * integrated yet (tasks/phase-12-wire-up/78-real-cart-orders.md: "Out of
 * scope: Payment provider capture").
 */
export async function placeOrderFromServerCart(
  db: Database,
  userId: string,
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const cartLines = await getServerCartLines(db, userId);

  if (cartLines.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  type ValidatedLine = {
    productId: string;
    variantId: string | null;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  };

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
  const shipping = estimateShippingBdt(input.address.city);
  const total = subtotal + shipping.amount;

  const orderId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(orders).values({
    id: orderId,
    userId,
    status: "PENDING",
    paymentStatus: "PENDING",
    paymentMethod: input.paymentMethod,
    subtotal,
    shippingTotal: shipping.amount,
    total,
    shippingFullName: input.address.fullName,
    shippingPhone: input.address.phone,
    shippingAddressLine1: input.address.addressLine1,
    shippingAddressLine2: input.address.addressLine2 ?? null,
    shippingCity: input.address.city,
    shippingPostalCode: input.address.postalCode ?? null,
    shippingLat: input.location?.lat ?? null,
    shippingLng: input.location?.lng ?? null,
    specialInstructions: input.specialInstructions?.trim() || null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(orderItems).values(
    validatedLines.map((line) => ({
      id: crypto.randomUUID(),
      orderId,
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

  await clearServerCart(db, userId);

  return { ok: true, orderId };
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
