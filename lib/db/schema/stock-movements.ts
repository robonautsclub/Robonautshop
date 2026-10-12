import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { inventory } from "@/lib/db/schema/inventory";
import { orders } from "@/lib/db/schema/orders";
import { STOCK_MOVEMENT_REASON_VALUES } from "@/lib/db/schema/shared";
import { users } from "@/lib/db/schema/users";

/**
 * Append-only history of every change to `inventory.stock_quantity`
 * (tasks/phase-19-admin-catalog/122). `delta` is signed; `stockAfter` is the
 * value right after the change, so the history reads without replaying it.
 * Reservations are not stock movements — they never change stock_quantity.
 */
export const stockMovements = sqliteTable(
  "stock_movements",
  {
    id: text("id").primaryKey(),
    inventoryId: text("inventory_id")
      .notNull()
      .references(() => inventory.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    delta: integer("delta").notNull(),
    stockAfter: integer("stock_after").notNull(),
    reason: text("reason", { enum: STOCK_MOVEMENT_REASON_VALUES }).notNull(),
    note: text("note"),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    orderId: text("order_id").references(() => orders.id, { onDelete: "set null" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("stock_movements_inventory_id_idx").on(table.inventoryId),
    index("stock_movements_created_at_idx").on(table.createdAt),
  ],
);
