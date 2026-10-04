import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { ORDER_STATUS_VALUES, PAYMENT_STATUS_VALUES } from "@/lib/db/schema/shared";
import { users } from "@/lib/db/schema/users";

/**
 * Real customer orders (tasks/phase-12-wire-up/78-real-cart-orders.md).
 * `status` and `paymentStatus` are separate columns on purpose — AGENTS.md
 * "Orders": "Do not combine these into one field".
 *
 * Address fields are a snapshot of where the order ships, not a live
 * reference to a saved address — the customer's address book can change
 * later without altering history of a placed order.
 *
 * `subtotal`/`shippingTotal`/`total` are computed and stored server-side at
 * order-creation time (lib/server-cart/actions.ts) — never taken from the
 * client (AGENTS.md "Pricing").
 */
export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: text("status", { enum: ORDER_STATUS_VALUES }).notNull().default("PENDING"),
    paymentStatus: text("payment_status", { enum: PAYMENT_STATUS_VALUES })
      .notNull()
      .default("PENDING"),
    paymentMethod: text("payment_method").notNull(),
    subtotal: integer("subtotal").notNull(),
    shippingTotal: integer("shipping_total").notNull(),
    total: integer("total").notNull(),
    shippingFullName: text("shipping_full_name").notNull(),
    shippingPhone: text("shipping_phone").notNull(),
    shippingAddressLine1: text("shipping_address_line1").notNull(),
    shippingAddressLine2: text("shipping_address_line2"),
    shippingCity: text("shipping_city").notNull(),
    shippingPostalCode: text("shipping_postal_code"),
    shippingLat: real("shipping_lat"),
    shippingLng: real("shipping_lng"),
    specialInstructions: text("special_instructions"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
  ],
);
