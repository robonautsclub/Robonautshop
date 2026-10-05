import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { COUPON_TYPE_VALUES } from "@/lib/db/schema/shared";

/**
 * Coupon codes (tasks/phase-14-advanced/87-coupons.md). `value` is a
 * percent (1-100) when `type` is PERCENT, or an integer BDT amount when
 * FIXED — validated server-side (lib/coupons/queries.ts), never trusted
 * from the client (AGENTS.md "Pricing").
 *
 * `code` is stored normalized (trimmed, uppercased) so lookups are a plain
 * equality check.
 */
export const coupons = sqliteTable(
  "coupons",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    type: text("type", { enum: COUPON_TYPE_VALUES }).notNull(),
    value: integer("value").notNull(),
    minSubtotal: integer("min_subtotal"),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    expiresAt: text("expires_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("coupons_active_idx").on(table.active)],
);
