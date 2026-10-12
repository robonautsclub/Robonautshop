import { and, eq } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import { updateOrderStatus } from "@/lib/orders/status-queries";
import { canCustomerCancelOrder } from "@/lib/orders/status-rules";

export type CustomerCancelResult =
  | { ok: true; orderId: string; refundPending: boolean }
  | { ok: false; error: string };

/**
 * Lets the order's owner cancel it before it is packed (task 130). Reuses
 * updateOrderStatus for the transition and the stock release, so there is one
 * cancel implementation.
 *
 * A paid bKash order keeps paymentStatus PAID after cancelling — that
 * "CANCELLED + PAID" combination is the manual-refund marker; no gateway
 * refund is attempted.
 */
export async function cancelOrderForCustomer(
  db: Database,
  userId: string,
  orderId: string,
): Promise<CustomerCancelResult> {
  const rows = await db
    .select({ id: orders.id, status: orders.status, paymentStatus: orders.paymentStatus })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);
  const order = rows[0];
  if (!order) {
    return { ok: false, error: "Order not found." };
  }

  if (!canCustomerCancelOrder(order.status)) {
    return { ok: false, error: "This order can no longer be cancelled because it is already packed or shipped." };
  }

  const result = await updateOrderStatus(db, orderId, "CANCELLED");
  if (!result.ok) {
    return result;
  }

  return { ok: true, orderId, refundPending: order.paymentStatus === "PAID" };
}
