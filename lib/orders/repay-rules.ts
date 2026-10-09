import type { OrderPaymentStatus, OrderStatus } from "@/lib/db/schema/shared";

/**
 * Whether a customer may retry paying an order with bKash. The one rule the
 * repay button (UI) and repayBkashOrder (server, authoritative) both use.
 * An order an admin cancelled stays cancelled.
 */
export function canRepayWithBkash(order: {
  paymentMethod: string;
  paymentStatus: OrderPaymentStatus;
  status: OrderStatus;
}): boolean {
  return (
    order.paymentMethod === "BKASH" &&
    order.status !== "CANCELLED" &&
    (order.paymentStatus === "FAILED" ||
      order.paymentStatus === "CANCELLED" ||
      order.paymentStatus === "PENDING")
  );
}
