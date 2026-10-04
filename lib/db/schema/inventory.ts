import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { productVariants } from "@/lib/db/schema/product-variants";
import { products } from "@/lib/db/schema/products";

/**
 * Matches the `InventorySummary` type in lib/catalog/types.ts.
 *
 * `variantId` is null when stock is tracked at the product level. Two
 * unique indexes enforce "at most one inventory row per thing being
 * tracked": one per variant, and (via a partial index) one product-level
 * row per product. Available stock = stockQuantity - reservedQuantity,
 * computed in `getAvailableQuantity()`, never stored (AGENTS.md "Avoid
 * storing calculated values").
 */
export const inventory = sqliteTable(
  "inventory",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    sku: text("sku").notNull(),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    reservedQuantity: integer("reserved_quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("inventory_product_id_idx").on(table.productId),
    uniqueIndex("inventory_variant_id_unique").on(table.variantId),
    uniqueIndex("inventory_product_level_unique")
      .on(table.productId)
      .where(sql`${table.variantId} is null`),
  ],
);
