import { desc, eq, inArray, sql } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { orderItems } from "@/lib/db/schema/order-items";
import { products } from "@/lib/db/schema/products";

/**
 * Simple product recommendations (tasks/phase-14-advanced/88-recommendations.md):
 * "customers who bought this also bought" — counts how often each other
 * product co-occurs with `productId` across real paid order line items.
 * Separate from lib/catalog/queries.ts `getRelatedProducts` (same category) —
 * this one is behavior-derived, not catalog-structure-derived.
 */
export async function getFrequentlyBoughtWith(
  db: Database,
  productId: string,
  limit = 4,
): Promise<Array<{ productId: string; name: string; slug: string; coOccurrences: number }>> {
  const orderIdsWithProduct = await db
    .select({ orderId: orderItems.orderId })
    .from(orderItems)
    .where(eq(orderItems.productId, productId));

  const orderIds = [...new Set(orderIdsWithProduct.map((row) => row.orderId))];
  if (orderIds.length === 0) {
    return [];
  }

  const rows = await db
    .select({
      productId: orderItems.productId,
      name: products.name,
      slug: products.slug,
      coOccurrences: sql<number>`count(distinct ${orderItems.orderId})`,
    })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(inArray(orderItems.orderId, orderIds))
    .groupBy(orderItems.productId, products.name, products.slug)
    .orderBy(desc(sql`count(distinct ${orderItems.orderId})`))
    .limit(limit + 1);

  return rows
    .filter((row) => row.productId !== productId)
    .filter((row): row is typeof row & { productId: string } => Boolean(row.productId))
    .slice(0, limit)
    .map((row) => ({ ...row, coOccurrences: Number(row.coOccurrences) }));
}
