import { and, eq } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { orderItems } from "@/lib/db/schema/order-items";
import { orders } from "@/lib/db/schema/orders";
import type { OrderStatus, OrderStockState } from "@/lib/db/schema/shared";
import {
  deductStockForOrderLines,
  releaseStockForOrderLines,
  toStockLines,
} from "@/lib/inventory/queries";
import { canTransitionOrder } from "@/lib/orders/status-rules";

export type UpdateOrderStatusResult =
  | { ok: true; status: OrderStatus }
  | { ok: false; error: string };

/** Stock state after moving to `next` (tasks/phase-18-hardening/109). */
function stockStateAfter(current: OrderStockState, next: OrderStatus): OrderStockState {
  if (next === "SHIPPED") return "DEDUCTED";
  if (next === "CANCELLED" && current === "RESERVED") return "NONE";
  return current;
}

/**
 * Moves a real order to its next fulfilment status and applies the matching
 * inventory change exactly once (tasks/phase-18-hardening/108, 109):
 * - → SHIPPED: units leave stock; a held reservation is consumed
 * - → CANCELLED: a held reservation is released
 *
 * The UPDATE is compare-and-set on the current status and stock state, so
 * two admins clicking at once cannot both apply the stock change.
 * Callers must already have checked the admin role.
 */
export async function updateOrderStatus(
  db: Database,
  orderId: string,
  next: OrderStatus,
): Promise<UpdateOrderStatusResult> {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = rows[0];
  if (!order) {
    return { ok: false, error: "Order not found." };
  }

  if (!canTransitionOrder(order.status, next, order.paymentStatus)) {
    return {
      ok: false,
      error: `An order that is ${order.status} (payment ${order.paymentStatus}) can't move to ${next}.`,
    };
  }

  const nextStockState = stockStateAfter(order.stockState, next);
  const updated = await db
    .update(orders)
    .set({ status: next, stockState: nextStockState, updatedAt: new Date().toISOString() })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.status, order.status),
        eq(orders.stockState, order.stockState),
      ),
    )
    .returning({ id: orders.id });

  if (updated.length === 0) {
    return { ok: false, error: "This order was just changed by someone else. Refresh and try again." };
  }

  if (nextStockState !== order.stockState) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    const lines = toStockLines(items);

    if (nextStockState === "DEDUCTED") {
      await deductStockForOrderLines(db, lines, {
        consumeReservation: order.stockState === "RESERVED",
      });
    } else {
      await releaseStockForOrderLines(db, lines);
    }
  }

  return { ok: true, status: next };
}
