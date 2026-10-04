import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { orders } from "@/lib/db/schema/orders";
import { productVariants } from "@/lib/db/schema/product-variants";
import { products } from "@/lib/db/schema/products";

/**
 * Order line items (tasks/phase-12-wire-up/78-real-cart-orders.md).
 *
 * `productName`/`sku`/`unitPrice` are snapshots taken at order-creation
 * time, not live joins — a product can be renamed, repriced, or even
 * deleted later without rewriting order history. `lineTotal` is stored
 * (not recomputed) for the same historical-accuracy reason; it is still
 * computed once, server-side, at creation (AGENTS.md "Pricing"), never
 * supplied by the client.
 *
 * `productId`/`variantId` use `set null` on delete — the snapshot fields
 * above keep the order line meaningful even if the catalog row is gone.
 */
export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    productName: text("product_name").notNull(),
    sku: text("sku").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(),
    lineTotal: integer("line_total").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
);
