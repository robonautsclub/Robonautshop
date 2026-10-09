import { describe, expect, it } from "vitest";

import { canRepayWithBkash } from "@/lib/orders/repay-rules";
import { canTransitionOrder, getNextOrderStatuses } from "@/lib/orders/status-rules";

describe("order status transitions", () => {
  it("walks a paid order through fulfilment in order", () => {
    expect(canTransitionOrder("PAID", "PROCESSING", "PAID")).toBe(true);
    expect(canTransitionOrder("PROCESSING", "PACKED", "PAID")).toBe(true);
    expect(canTransitionOrder("PACKED", "SHIPPED", "PAID")).toBe(true);
    expect(canTransitionOrder("SHIPPED", "DELIVERED", "PAID")).toBe(true);
  });

  it("does not skip steps or go backwards", () => {
    expect(canTransitionOrder("PAID", "SHIPPED", "PAID")).toBe(false);
    expect(canTransitionOrder("PACKED", "PROCESSING", "PAID")).toBe(false);
  });

  it("only cancels before shipping", () => {
    expect(canTransitionOrder("PACKED", "CANCELLED", "PAID")).toBe(true);
    expect(canTransitionOrder("SHIPPED", "CANCELLED", "PAID")).toBe(false);
  });

  it("will not fulfil an unpaid order", () => {
    expect(getNextOrderStatuses("PENDING", "PENDING")).toEqual(["CANCELLED"]);
    expect(getNextOrderStatuses("PAYMENT_PENDING", "FAILED")).toEqual(["CANCELLED"]);
  });

  it("treats delivered and cancelled as final", () => {
    expect(getNextOrderStatuses("DELIVERED", "PAID")).toEqual([]);
    expect(getNextOrderStatuses("CANCELLED", "PAID")).toEqual([]);
  });
});

describe("canRepayWithBkash", () => {
  it("allows retrying failed, cancelled, or pending bKash payments", () => {
    for (const paymentStatus of ["FAILED", "CANCELLED", "PENDING"] as const) {
      expect(
        canRepayWithBkash({ paymentMethod: "BKASH", paymentStatus, status: "PAYMENT_PENDING" }),
      ).toBe(true);
    }
  });

  it("refuses paid orders and orders an admin cancelled", () => {
    expect(
      canRepayWithBkash({ paymentMethod: "BKASH", paymentStatus: "PAID", status: "PAID" }),
    ).toBe(false);
    expect(
      canRepayWithBkash({ paymentMethod: "BKASH", paymentStatus: "FAILED", status: "CANCELLED" }),
    ).toBe(false);
  });
});
