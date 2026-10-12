import { sql } from "drizzle-orm";
import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { productVariants } from "@/lib/db/schema/product-variants";
import { products } from "@/lib/db/schema/products";

/**
 * "Notify me when back in stock" sign-ups (task 141). `variantId` is null
 * for products tracked at product level. One row per email per product
 * variant (see `variantKey`), and `sentAt`
 * is set once the email has gone out so it is never sent twice.
 */
export const backInStockSubscriptions = sqliteTable(
  "back_in_stock_subscriptions",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
    /** variantId, or '' when none — makes the unique index below work (NULLs never collide). */
    variantKey: text("variant_key").notNull().default(""),
    email: text("email").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    sentAt: text("sent_at"),
  },
  (table) => [
    uniqueIndex("back_in_stock_unique").on(table.email, table.productId, table.variantKey),
    index("back_in_stock_product_idx").on(table.productId, table.variantId),
  ],
);
