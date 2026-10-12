import type { UserRole } from "@/lib/db/schema/shared";

/**
 * The one permission map (task 146). Every admin action and page calls
 * requirePermission() (lib/auth/session.ts), which uses hasPermission()
 * here; the admin nav uses the same function only to hide links. Hiding is
 * a convenience — the server check is what enforces access.
 */

export const PERMISSIONS = [
  "analytics.view",
  "catalog.manage",
  "inventory.manage",
  "orders.manage",
  "returns.manage",
  "coupons.manage",
  "customers.view",
  "reviews.moderate",
  "questions.answer",
  "users.manage",
  "audit.view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const STAFF_ROLE_PERMISSIONS: Record<Exclude<UserRole, "CUSTOMER" | "ADMIN">, readonly Permission[]> = {
  STAFF: ["customers.view", "reviews.moderate", "questions.answer"],
  ORDER_MANAGER: ["orders.manage", "returns.manage", "customers.view"],
  INVENTORY_MANAGER: ["inventory.manage"],
  CONTENT_MANAGER: ["catalog.manage", "reviews.moderate", "questions.answer"],
};

/** Who may sign in to /admin at all (everyone except shoppers). */
export function isBackOfficeRole(role: string | null | undefined): role is Exclude<UserRole, "CUSTOMER"> {
  return role === "ADMIN" || (typeof role === "string" && Object.hasOwn(STAFF_ROLE_PERMISSIONS, role));
}

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  if (role === "ADMIN") return true; // ADMIN keeps full access
  if (!role || !Object.hasOwn(STAFF_ROLE_PERMISSIONS, role)) return false;
  return STAFF_ROLE_PERMISSIONS[role as keyof typeof STAFF_ROLE_PERMISSIONS].includes(permission);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: "Customer",
  ADMIN: "Admin",
  STAFF: "Staff",
  ORDER_MANAGER: "Order manager",
  INVENTORY_MANAGER: "Inventory manager",
  CONTENT_MANAGER: "Content manager",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  CUSTOMER: "Shopper account with no admin access.",
  ADMIN: "Full access, including users and roles.",
  STAFF: "Customers (read-only), review moderation and product Q&A.",
  ORDER_MANAGER: "Orders, returns and warranty, customers (read-only).",
  INVENTORY_MANAGER: "Inventory and stock adjustments.",
  CONTENT_MANAGER: "Products, categories, kits, projects, reviews and Q&A.",
};
