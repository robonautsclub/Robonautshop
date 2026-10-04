import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { categories } from "@/lib/db/schema/categories";
import { PRODUCT_STATUS_VALUES } from "@/lib/db/schema/shared";

/**
 * Matches the `Product` type in lib/catalog/types.ts.
 *
 * `price` / `compareAtPrice` are integer BDT taka (৳), never fractional —
 * see the pricing note at the top of lib/catalog/types.ts. `specifications`
 * is a flexible JSON map (AGENTS.md "Product Data": don't create a column
 * per possible spec).
 */
export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    sku: text("sku").notNull().unique(),
    description: text("description").notNull(),
    shortDescription: text("short_description").notNull(),
    brand: text("brand"),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    weightGrams: integer("weight_grams"),
    status: text("status", { enum: PRODUCT_STATUS_VALUES })
      .notNull()
      .default("DRAFT"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    specifications: text("specifications", { mode: "json" })
      .$type<Record<string, string>>()
      .notNull()
      .default(sql`'{}'`),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("products_category_id_idx").on(table.categoryId),
    index("products_status_idx").on(table.status),
  ],
);
