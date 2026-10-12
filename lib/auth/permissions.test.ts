import { describe, expect, it } from "vitest";

import { hasPermission, isBackOfficeRole, PERMISSIONS } from "@/lib/auth/permissions";

describe("permissions", () => {
  it("gives ADMIN everything", () => {
    for (const permission of PERMISSIONS) {
      expect(hasPermission("ADMIN", permission)).toBe(true);
    }
  });

  it("lets an ORDER_MANAGER manage orders but not products or users", () => {
    expect(hasPermission("ORDER_MANAGER", "orders.manage")).toBe(true);
    expect(hasPermission("ORDER_MANAGER", "catalog.manage")).toBe(false);
    expect(hasPermission("ORDER_MANAGER", "inventory.manage")).toBe(false);
    expect(hasPermission("ORDER_MANAGER", "users.manage")).toBe(false);
  });

  it("keeps users.manage and analytics for ADMIN only", () => {
    for (const role of ["STAFF", "ORDER_MANAGER", "INVENTORY_MANAGER", "CONTENT_MANAGER", "CUSTOMER"]) {
      expect(hasPermission(role, "users.manage")).toBe(false);
      expect(hasPermission(role, "analytics.view")).toBe(false);
    }
  });

  it("denies customers, unknown roles and signed-out callers", () => {
    expect(hasPermission("CUSTOMER", "customers.view")).toBe(false);
    expect(hasPermission("HACKER", "orders.manage")).toBe(false);
    expect(hasPermission("toString", "orders.manage")).toBe(false);
    expect(hasPermission(undefined, "orders.manage")).toBe(false);
    expect(hasPermission(null, "orders.manage")).toBe(false);
  });

  it("treats every non-customer role as back-office", () => {
    expect(isBackOfficeRole("STAFF")).toBe(true);
    expect(isBackOfficeRole("ADMIN")).toBe(true);
    expect(isBackOfficeRole("CUSTOMER")).toBe(false);
    expect(isBackOfficeRole("toString")).toBe(false);
    expect(isBackOfficeRole(undefined)).toBe(false);
  });
});
