import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { productVariants } from "@/lib/db/schema/product-variants";
import { products } from "@/lib/db/schema/products";
import { users } from "@/lib/db/schema/users";

/**
 * Server-owned cart for signed-in customers
 * (tasks/phase-12-wire-up/78-real-cart-orders.md: "Server-owned cart for
 * the signed-in user (persist lines against userId)"). Guests still use
 * the client-side localStorage cart (lib/cart/) — only a real session gets
 * a row here, merged in on login (lib/server-cart/queries.ts).
 *
 * One row per (user, product, variant) — `set null` on variant delete so a
 * removed variant gracefully falls back to the base product line, same
 * reasoning as kit_components / project_components.
 */
export const cartItems = sqliteTable(
  "cart_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("cart_items_user_id_idx").on(table.userId),
    // Same "variant vs. product-level" uniqueness split as lib/db/schema/inventory.ts:
    // NULL variant_id values are distinct from each other in SQLite, so a
    // plain unique(user_id, product_id, variant_id) wouldn't stop duplicate
    // product-level (non-variant) lines for the same user.
    uniqueIndex("cart_items_user_variant_unique").on(table.userId, table.variantId),
    uniqueIndex("cart_items_user_product_level_unique")
      .on(table.userId, table.productId)
      .where(sql`${table.variantId} is null`),
  ],
);
