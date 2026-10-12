import type { OrderPaymentStatus, OrderStatus } from "@/lib/db/schema/shared";

/**
 * The one order-fulfilment transition table (tasks/phase-18-hardening/108).
 * Only order `status` moves here — payment status is separate and is only
 * ever set by verified payment callbacks (AGENTS.md §16, §17).
 */
const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PAYMENT_PENDING: ["CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

/** Fulfilment steps that need the money first (bKash is the only method). */
const REQUIRES_PAYMENT: readonly OrderStatus[] = [
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

export function getNextOrderStatuses(
  status: OrderStatus,
  paymentStatus: OrderPaymentStatus,
): OrderStatus[] {
  return TRANSITIONS[status].filter(
    (next) => paymentStatus === "PAID" || !REQUIRES_PAYMENT.includes(next),
  );
}

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
  paymentStatus: OrderPaymentStatus,
): boolean {
  return getNextOrderStatuses(from, paymentStatus).includes(to);
}
