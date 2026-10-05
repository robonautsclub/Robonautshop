import { and, desc, eq } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { productReviews } from "@/lib/db/schema/product-reviews";
import { users } from "@/lib/db/schema/users";

export type ProductReviewRecord = typeof productReviews.$inferSelect;

export type ProductReviewWithAuthor = ProductReviewRecord & {
  authorName: string;
};

export type ProductReviewSummary = {
  count: number;
  averageRating: number;
};

export async function getReviewsForProduct(
  db: Database,
  productId: string,
): Promise<ProductReviewWithAuthor[]> {
  const rows = await db
    .select({
      id: productReviews.id,
      productId: productReviews.productId,
      userId: productReviews.userId,
      rating: productReviews.rating,
      title: productReviews.title,
      body: productReviews.body,
      createdAt: productReviews.createdAt,
      updatedAt: productReviews.updatedAt,
      authorName: users.name,
    })
    .from(productReviews)
    .innerJoin(users, eq(users.id, productReviews.userId))
    .where(eq(productReviews.productId, productId))
    .orderBy(desc(productReviews.createdAt));

  return rows;
}

export async function getReviewSummaryForProduct(
  db: Database,
  productId: string,
): Promise<ProductReviewSummary> {
  const rows = await db
    .select({ rating: productReviews.rating })
    .from(productReviews)
    .where(eq(productReviews.productId, productId));

  if (rows.length === 0) {
    return { count: 0, averageRating: 0 };
  }

  const total = rows.reduce((sum, row) => sum + row.rating, 0);
  return { count: rows.length, averageRating: total / rows.length };
}

/** Batched version for product grids — one query, not one per card. */
export async function getReviewSummariesForProducts(
  db: Database,
  productIds: string[],
): Promise<Map<string, ProductReviewSummary>> {
  const summaries = new Map<string, ProductReviewSummary>();
  if (productIds.length === 0) {
    return summaries;
  }

  const rows = await db
    .select({ productId: productReviews.productId, rating: productReviews.rating })
    .from(productReviews);

  const idSet = new Set(productIds);
  for (const row of rows) {
    if (!idSet.has(row.productId)) continue;
    const existing = summaries.get(row.productId) ?? { count: 0, averageRating: 0 };
    const total = existing.averageRating * existing.count + row.rating;
    const count = existing.count + 1;
    summaries.set(row.productId, { count, averageRating: total / count });
  }

  return summaries;
}

export async function getMyReviewForProduct(
  db: Database,
  userId: string,
  productId: string,
): Promise<ProductReviewRecord | null> {
  const rows = await db
    .select()
    .from(productReviews)
    .where(and(eq(productReviews.userId, userId), eq(productReviews.productId, productId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Create-or-update: one review per (user, product) — see schema comment. */
export async function upsertReview(
  db: Database,
  args: { userId: string; productId: string; rating: number; title?: string | null; body: string },
): Promise<ProductReviewRecord> {
  const existing = await getMyReviewForProduct(db, args.userId, args.productId);
  const now = new Date().toISOString();

  if (existing) {
    await db
      .update(productReviews)
      .set({
        rating: args.rating,
        title: args.title?.trim() || null,
        body: args.body,
        updatedAt: now,
      })
      .where(eq(productReviews.id, existing.id));
    return { ...existing, rating: args.rating, title: args.title?.trim() || null, body: args.body, updatedAt: now };
  }

  const id = crypto.randomUUID();
  await db.insert(productReviews).values({
    id,
    productId: args.productId,
    userId: args.userId,
    rating: args.rating,
    title: args.title?.trim() || null,
    body: args.body,
    createdAt: now,
    updatedAt: now,
  });

  const rows = await db.select().from(productReviews).where(eq(productReviews.id, id)).limit(1);
  return rows[0]!;
}

export async function deleteReview(
  db: Database,
  userId: string,
  reviewId: string,
): Promise<boolean> {
  const rows = await db
    .select()
    .from(productReviews)
    .where(and(eq(productReviews.id, reviewId), eq(productReviews.userId, userId)))
    .limit(1);
  if (!rows[0]) {
    return false;
  }
  await db
    .delete(productReviews)
    .where(and(eq(productReviews.id, reviewId), eq(productReviews.userId, userId)));
  return true;
}
