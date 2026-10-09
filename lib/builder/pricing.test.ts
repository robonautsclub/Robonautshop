import { describe, expect, it } from "vitest";

import {
  calculateBuildTotal,
  getAvailableLines,
  getUnavailableLines,
} from "@/lib/builder/pricing";
import type { RequirementLine } from "@/lib/catalog";
import { mockProducts } from "@/lib/catalog/mock-data";

function line(
  id: string,
  unitPrice: number,
  quantity: number,
  availableQuantity: number,
): RequirementLine {
  return {
    id,
    product: mockProducts[0],
    variant: null,
    quantity,
    optional: false,
    unitPrice,
    lineTotal: unitPrice * quantity,
    availableQuantity,
    lowStockThreshold: 5,
    imageUrl: null,
    imageAlt: "",
  };
}

const lines = [line("nano", 650, 1, 10), line("n20", 350, 2, 1), line("ir", 480, 1, 1)];

describe("calculateBuildTotal", () => {
  it("sums every required line's total", () => {
    expect(calculateBuildTotal(lines)).toBe(650 + 700 + 480);
  });

  it("is 0 for no lines", () => {
    expect(calculateBuildTotal([])).toBe(0);
  });
});

describe("availability split", () => {
  it("marks a line unavailable when stock is below the needed quantity", () => {
    expect(getUnavailableLines(lines).map((item) => item.id)).toEqual(["n20"]);
  });

  it("treats exactly-enough stock as available", () => {
    expect(getAvailableLines(lines).map((item) => item.id)).toEqual(["nano", "ir"]);
  });

  it("partitions every line exactly once", () => {
    expect(getAvailableLines(lines).length + getUnavailableLines(lines).length).toBe(
      lines.length,
    );
  });
});
