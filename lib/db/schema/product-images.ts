import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { products } from "@/lib/db/schema/products";

/**
 * Matches the `ProductImage` type in lib/catalog/types.ts.
 *
 * `url` holds either a plain URL (current mock data) or a future R2 object
 * key/URL (AGENTS.md "Product Images": the database stores references, not
 * image bytes — those live in R2, see tasks/phase-10-backend-cloudflare/
 * 64-configure-r2.md).
 */
export const productImages = sqliteTable(
  "product_images",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("product_images_product_id_idx").on(table.productId)],
);
