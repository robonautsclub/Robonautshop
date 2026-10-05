import { and, eq } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { wishlistItems } from "@/lib/db/schema/wishlist-items";

export async function listWishlistProductIds(
  db: Database,
  userId: string,
): Promise<string[]> {
  const rows = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));
  return rows.map((row) => row.productId);
}

export async function isInWishlist(
  db: Database,
  userId: string,
  productId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: wishlistItems.id })
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)))
    .limit(1);
  return rows.length > 0;
}

/** Returns the new state (true = now wishlisted, false = now removed). */
export async function toggleWishlistItem(
  db: Database,
  userId: string,
  productId: string,
): Promise<boolean> {
  const existing = await isInWishlist(db, userId, productId);

  if (existing) {
    await db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
    return false;
  }

  await db.insert(wishlistItems).values({
    id: crypto.randomUUID(),
    userId,
    productId,
    createdAt: new Date().toISOString(),
  });
  return true;
}
