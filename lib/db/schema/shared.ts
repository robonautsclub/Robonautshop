import type { ProductStatus, ProjectSkillLevel } from "@/lib/catalog/types";

/**
 * Shared enum value tuples for Drizzle `text({ enum: [...] })` columns.
 *
 * Kept here once and imported everywhere (products, kits, robot projects)
 * instead of repeating the literal list per table — see AGENTS.md
 * "Business logic should not be duplicated". The `satisfies` check keeps
 * these in sync with the frontend catalog types if either one changes.
 */
export const PRODUCT_STATUS_VALUES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
] as const satisfies readonly ProductStatus[];

export const PROJECT_SKILL_LEVEL_VALUES = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "COMPETITION",
] as const satisfies readonly ProjectSkillLevel[];

/**
 * Order status and payment status are deliberately separate fields
 * (AGENTS.md "Orders": "Do not combine these into one field").
 */
export const ORDER_STATUS_VALUES = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const PAYMENT_STATUS_VALUES = [
  "PENDING",
  "AUTHORIZED",
  "PAID",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
] as const;

/**
 * What an order currently holds against inventory (tasks/phase-18-hardening
 * 104/105/109). Tracked on the order so reserve, release, and deduct each
 * happen at most once per order:
 * - NONE: nothing held (e.g. a failed/cancelled bKash attempt)
 * - RESERVED: `reservedQuantity` was incremented for its lines
 * - DEDUCTED: shipped — `stockQuantity` was reduced and the reservation consumed
 */
export const ORDER_STOCK_STATE_VALUES = ["NONE", "RESERVED", "DEDUCTED"] as const;
export type OrderStockState = (typeof ORDER_STOCK_STATE_VALUES)[number];

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];
export type OrderPaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];

/** Percent (of subtotal) or a fixed BDT amount off — tasks/phase-14-advanced/87-coupons.md. */
export const COUPON_TYPE_VALUES = ["PERCENT", "FIXED"] as const;
export type CouponType = (typeof COUPON_TYPE_VALUES)[number];

/** tasks/phase-14-advanced/90-analytics.md — lightweight, self-hosted event log. */
export const ANALYTICS_EVENT_TYPE_VALUES = [
  "PRODUCT_VIEW",
  "SEARCH",
  "ADD_TO_CART",
] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPE_VALUES)[number];

/**
 * Why a stock quantity changed (tasks/phase-19-admin-catalog/122). Admin
 * adjustments pick one of the first five; ORDER_SHIPPED is written by the
 * ship step (task 109) so every stock change has a history row.
 */
export const STOCK_MOVEMENT_REASON_VALUES = [
  "RECEIVED",
  "DAMAGED",
  "RECOUNT",
  "RETURNED",
  "CORRECTION",
  "ORDER_SHIPPED",
] as const;
export type StockMovementReason = (typeof STOCK_MOVEMENT_REASON_VALUES)[number];
export const ADMIN_STOCK_REASONS = [
  "RECEIVED",
  "DAMAGED",
  "RECOUNT",
  "RETURNED",
  "CORRECTION",
] as const satisfies readonly StockMovementReason[];
