import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { orderItems } from "@/lib/db/schema/order-items";
import { orders } from "@/lib/db/schema/orders";
import { users } from "@/lib/db/schema/users";

export const RETURN_TYPE_VALUES = ["RETURN", "WARRANTY"] as const;
export type ReturnType = (typeof RETURN_TYPE_VALUES)[number];

export const RETURN_REASON_VALUES = [
  "DEFECTIVE",
  "WRONG_ITEM",
  "NOT_AS_DESCRIBED",
  "CHANGED_MIND",
  "OTHER",
] as const;
export type ReturnReason = (typeof RETURN_REASON_VALUES)[number];

export const RETURN_STATUS_VALUES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ReturnStatus = (typeof RETURN_STATUS_VALUES)[number];

/**
 * Customer return / warranty requests for a delivered order line (task 145).
 * Refunds and replacements happen manually outside the app; approving a
 * RETURN restocks the item through a stock movement (lib/returns/queries.ts).
 */
export const returnRequests = sqliteTable(
  "return_requests",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", { enum: RETURN_TYPE_VALUES }).notNull(),
    reason: text("reason", { enum: RETURN_REASON_VALUES }).notNull(),
    quantity: integer("quantity").notNull(),
    note: text("note"),
    status: text("status", { enum: RETURN_STATUS_VALUES }).notNull().default("PENDING"),
    /** Admin's decision note, shown to the customer. */
    adminNote: text("admin_note"),
    decidedAt: text("decided_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("return_requests_order_id_idx").on(table.orderId),
    index("return_requests_order_item_id_idx").on(table.orderItemId),
    index("return_requests_status_idx").on(table.status),
  ],
);
