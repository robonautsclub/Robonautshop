import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { products } from "@/lib/db/schema/products";
import { users } from "@/lib/db/schema/users";

/**
 * Product reviews (tasks/phase-14-advanced/85-reviews.md). `rating` is
 * validated server-side to be an integer 1-5 (lib/reviews/actions.ts) —
 * SQLite has no CHECK-constraint builder in this Drizzle version, so the
 * app layer is the enforcement point, same as AGENTS.md "Validation".
 *
 * One review per (user, product) — editing resubmits the same row rather
 * than creating a second one.
 */
export const productReviews = sqliteTable(
  "product_reviews",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("product_reviews_product_id_idx").on(table.productId),
    uniqueIndex("product_reviews_user_product_unique").on(table.userId, table.productId),
  ],
);
