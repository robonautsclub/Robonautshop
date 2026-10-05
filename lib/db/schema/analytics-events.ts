import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { products } from "@/lib/db/schema/products";
import { ANALYTICS_EVENT_TYPE_VALUES } from "@/lib/db/schema/shared";

/**
 * Basic storefront analytics hooks (tasks/phase-14-advanced/90-analytics.md).
 * A lightweight, self-hosted event log — no external analytics service
 * (AGENTS.md "Do not over-engineer"). `query` is only set for SEARCH
 * events; `productId` only for PRODUCT_VIEW / ADD_TO_CART.
 */
export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    id: text("id").primaryKey(),
    type: text("type", { enum: ANALYTICS_EVENT_TYPE_VALUES }).notNull(),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    query: text("query"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("analytics_events_type_idx").on(table.type),
    index("analytics_events_created_at_idx").on(table.createdAt),
    index("analytics_events_product_id_idx").on(table.productId),
  ],
);
