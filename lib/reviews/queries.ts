import { and, desc, eq, exists, sql } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { orderItems } from "@/lib/db/schema/order-items";
import { orders } from "@/lib/db/schema/orders";
import { productReviews, type ReviewStatus } from "@/lib/db/schema/product-reviews";
import { products } from "@/lib/db/schema/products";
import { users } from "@/lib/db/schema/users";

export type ProductReviewRecord = typeof productReviews.$inferSelect;

export type ProductReviewWithAuthor = ProductReviewRecord & {
  authorName: string;
  /** The author has a delivered order containing this product (computed server-side). */
  verifiedPurchase: boolean;
};

export type ProductReviewSummary = {
  count: number;
  averageRating: number;
};

/** True when `userId` has a DELIVERED order containing the review's product. */
function hasDeliveredPurchase() {
  return exists(
    sql`(select 1 from ${orderItems} inner join ${orders} on ${orders.id} = ${orderItems.orderId}
         where ${orderItems.productId} = ${productReviews.productId}
         and ${orders.userId} = ${productReviews.userId}
         and ${orders.status} = 'DELIVERED')`,
  );
}

/** Public reviews only: moderation status must be APPROVED. */
export async function getReviewsForProduct(
  db: Database,
  productId: string,
): Promise<ProductReviewWithAuthor[]> {
  return db
    .select({
      id: productReviews.id,
      productId: productReviews.productId,
      userId: productReviews.userId,
      rating: productReviews.rating,
      title: productReviews.title,
      body: productReviews.body,
      status: productReviews.status,
      createdAt: productReviews.createdAt,
      updatedAt: productReviews.updatedAt,
      authorName: users.name,
      verifiedPurchase: sql<boolean>`${hasDeliveredPurchase()}`.mapWith(Boolean),
    })
    .from(productReviews)
    .innerJoin(users, eq(users.id, productReviews.userId))
    .where(and(eq(productReviews.productId, productId), eq(productReviews.status, "APPROVED")))
    .orderBy(desc(productReviews.createdAt));
}

export async function getReviewSummaryForProduct(
  db: Database,
  productId: string,
): Promise<ProductReviewSummary> {
  const rows = await db
    .select({ rating: productReviews.rating })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.status, "APPROVED")));

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
    .from(productReviews)
    .where(eq(productReviews.status, "APPROVED"));

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
        // An edited review goes back through moderation.
        status: "PENDING",
        updatedAt: now,
      })
      .where(eq(productReviews.id, existing.id));
    return {
      ...existing,
      rating: args.rating,
      title: args.title?.trim() || null,
      body: args.body,
      status: "PENDING",
      updatedAt: now,
    };
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

export type AdminReview = {
  id: string;
  productName: string;
  productSlug: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  status: ReviewStatus;
  createdAt: string;
};

export async function listReviewsForAdmin(db: Database): Promise<AdminReview[]> {
  return db
    .select({
      id: productReviews.id,
      productName: products.name,
      productSlug: products.slug,
      authorName: users.name,
      rating: productReviews.rating,
      title: productReviews.title,
      body: productReviews.body,
      status: productReviews.status,
      createdAt: productReviews.createdAt,
    })
    .from(productReviews)
    .innerJoin(products, eq(products.id, productReviews.productId))
    .innerJoin(users, eq(users.id, productReviews.userId))
    .orderBy(desc(productReviews.createdAt));
}

/** Moderation decision; returns the product slug so callers can revalidate its page. */
export async function setReviewStatus(
  db: Database,
  reviewId: string,
  status: ReviewStatus,
): Promise<{ ok: true; productSlug: string } | { ok: false; error: string }> {
  const updated = await db
    .update(productReviews)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(productReviews.id, reviewId))
    .returning({ productId: productReviews.productId });
  if (!updated[0]) {
    return { ok: false, error: "Review not found." };
  }
  const product = (
    await db
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.id, updated[0].productId))
      .limit(1)
  )[0];
  return { ok: true, productSlug: product?.slug ?? "" };
}
