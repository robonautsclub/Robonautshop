import { sql } from "drizzle-orm";
import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { products } from "@/lib/db/schema/products";
import { users } from "@/lib/db/schema/users";

/** Customer wishlist (tasks/phase-14-advanced/86-wishlist.md). One row per (user, product). */
export const wishlistItems = sqliteTable(
  "wishlist_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("wishlist_items_user_id_idx").on(table.userId),
    uniqueIndex("wishlist_items_user_product_unique").on(table.userId, table.productId),
  ],
);
