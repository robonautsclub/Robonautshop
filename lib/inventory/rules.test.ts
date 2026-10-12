import { describe, expect, it } from "vitest";

import {
  canReserve,
  getLineAvailableQuantity,
  pickInventoryRow,
  releasedQuantity,
} from "@/lib/inventory/rules";

const rows = [
  { variantId: "v1", stockQuantity: 10, reservedQuantity: 4, lowStockThreshold: 2, sku: "V1", productId: "p" },
  { variantId: null, stockQuantity: 3, reservedQuantity: 1, lowStockThreshold: 1, sku: "P", productId: "p" },
];

describe("pickInventoryRow", () => {
  it("picks the variant row for a variant line", () => {
    expect(pickInventoryRow(rows, "v1")?.sku).toBe("V1");
  });
  it("picks the product-level row for a product line", () => {
    expect(pickInventoryRow(rows, null)?.sku).toBe("P");
  });
  it("falls back to the first row when only variants are tracked", () => {
    expect(pickInventoryRow([rows[0]], null)?.sku).toBe("V1");
  });
  it("returns null for an unknown variant", () => {
    expect(pickInventoryRow(rows, "v404")).toBeNull();
  });
});

describe("availability rules", () => {
  it("available = stock - reserved, 0 when untracked", () => {
    expect(getLineAvailableQuantity(rows, "v1")).toBe(6);
    expect(getLineAvailableQuantity(rows, "v404")).toBe(0);
  });
  it("canReserve only within available stock", () => {
    expect(canReserve(rows[0], 6)).toBe(true);
    expect(canReserve(rows[0], 7)).toBe(false);
    expect(canReserve(rows[0], 0)).toBe(false);
  });
  it("release never goes below zero", () => {
    expect(releasedQuantity(3, 2)).toBe(1);
    expect(releasedQuantity(3, 5)).toBe(0);
  });
});
