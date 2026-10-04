/**
 * The server-owned cart for signed-in customers
 * (tasks/phase-12-wire-up/78-real-cart-orders.md). Guests still use the
 * client-side localStorage cart (lib/cart/) — rows here only ever belong
 * to a real `userId`.
 */
import { eq } from "drizzle-orm";

import { mergeCartLines } from "@/lib/cart/calculations";
import type { CartLineInput } from "@/lib/cart/types";
import type { Database } from "@/lib/db";
import { cartItems } from "@/lib/db/schema/cart-items";

export async function getServerCartLines(
  db: Database,
  userId: string,
): Promise<CartLineInput[]> {
  const rows = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  return rows.map((row) => ({
    productId: row.productId,
    variantId: row.variantId,
    quantity: row.quantity,
  }));
}

/**
 * Replaces the signed-in user's entire cart with `lines` (delete, then
 * bulk insert). Simple "upload the whole cart on every change" sync, not
 * incremental diffing — correct and easy to reason about for a cart this
 * small; not the right call for something with thousands of rows.
 */
export async function setServerCartLines(
  db: Database,
  userId: string,
  lines: CartLineInput[],
): Promise<void> {
  const cleaned = lines.filter((line) => line.quantity > 0);
  const now = new Date().toISOString();

  await db.delete(cartItems).where(eq(cartItems.userId, userId));

  if (cleaned.length === 0) {
    return;
  }

  await db.insert(cartItems).values(
    cleaned.map((line) => ({
      id: crypto.randomUUID(),
      userId,
      productId: line.productId,
      variantId: line.variantId,
      quantity: line.quantity,
      createdAt: now,
      updatedAt: now,
    })),
  );
}

/**
 * Guest → signed-in-user merge (tasks/phase-12-wire-up/78b). Reuses the one
 * merge rule from lib/cart/calculations.ts instead of reimplementing it
 * against D1 rows.
 */
export async function mergeGuestCartIntoServerCart(
  db: Database,
  userId: string,
  guestLines: CartLineInput[],
): Promise<CartLineInput[]> {
  const userLines = await getServerCartLines(db, userId);
  const merged = mergeCartLines(userLines, guestLines);
  await setServerCartLines(db, userId, merged);
  return merged;
}

export async function clearServerCart(db: Database, userId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}
