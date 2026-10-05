import { and, desc, eq, gte, sql } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema/analytics-events";
import type { AnalyticsEventType } from "@/lib/db/schema/shared";
import { products } from "@/lib/db/schema/products";

/**
 * Basic storefront analytics hooks (tasks/phase-14-advanced/90-analytics.md).
 * Fire-and-forget: a logging failure must never break the page that
 * triggered it (AGENTS.md "Error handling" — still logged, just not
 * rethrown here).
 */
export async function recordAnalyticsEvent(
  db: Database,
  input: { type: AnalyticsEventType; productId?: string | null; query?: string | null },
): Promise<void> {
  try {
    await db.insert(analyticsEvents).values({
      id: crypto.randomUUID(),
      type: input.type,
      productId: input.productId ?? null,
      query: input.query?.trim().slice(0, 200) || null,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[analytics] failed to record event", error);
  }
}

export type TopProductRow = {
  productId: string;
  productName: string;
  views: number;
};

export type TopSearchRow = {
  query: string;
  count: number;
};

export type AnalyticsSummary = {
  productViews: number;
  searches: number;
  addToCarts: number;
  topProducts: TopProductRow[];
  topSearches: TopSearchRow[];
};

/** Admin-only summary over the last `days` days (tasks/phase-14-advanced/90-analytics.md). */
export async function getAnalyticsSummary(
  db: Database,
  days = 30,
): Promise<AnalyticsSummary> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [viewRows, searchRows, cartRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.type, "PRODUCT_VIEW"), gte(analyticsEvents.createdAt, since))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.type, "SEARCH"), gte(analyticsEvents.createdAt, since))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.type, "ADD_TO_CART"), gte(analyticsEvents.createdAt, since))),
  ]);

  const topProductRows = await db
    .select({
      productId: analyticsEvents.productId,
      productName: products.name,
      views: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .innerJoin(products, eq(products.id, analyticsEvents.productId))
    .where(and(eq(analyticsEvents.type, "PRODUCT_VIEW"), gte(analyticsEvents.createdAt, since)))
    .groupBy(analyticsEvents.productId, products.name)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const topSearchRows = await db
    .select({ query: analyticsEvents.query, count: sql<number>`count(*)` })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.type, "SEARCH"), gte(analyticsEvents.createdAt, since)))
    .groupBy(analyticsEvents.query)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  return {
    productViews: Number(viewRows[0]?.count ?? 0),
    searches: Number(searchRows[0]?.count ?? 0),
    addToCarts: Number(cartRows[0]?.count ?? 0),
    topProducts: topProductRows
      .filter((row): row is { productId: string; productName: string; views: number } =>
        Boolean(row.productId),
      )
      .map((row) => ({ ...row, views: Number(row.views) })),
    topSearches: topSearchRows
      .filter((row): row is { query: string; count: number } => Boolean(row.query))
      .map((row) => ({ query: row.query, count: Number(row.count) })),
  };
}
