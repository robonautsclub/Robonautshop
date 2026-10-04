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

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];
export type OrderPaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];
