import { describe, expect, it } from "vitest";

import {
  likeContains,
  matchesAdminOrderFilters,
  nextDay,
  parseAdminOrderFilters,
} from "@/lib/orders/admin-filters";

describe("parseAdminOrderFilters", () => {
  it("keeps valid params and drops invalid ones", () => {
    expect(
      parseAdminOrderFilters({ q: " 017 ", status: "SHIPPED", payment: "NOPE", from: "2026-10-01", to: "yesterday" }),
    ).toEqual({ q: "017", status: "SHIPPED", payment: undefined, from: "2026-10-01", to: undefined });
  });
});

describe("helpers", () => {
  it("computes the next day across month ends", () => {
    expect(nextDay("2026-10-31")).toBe("2026-11-01");
  });

  it("escapes LIKE wildcards", () => {
    expect(likeContains("50%_off")).toBe("%50\\%\\_off%");
  });
});

describe("matchesAdminOrderFilters", () => {
  const order = {
    id: "RN-1001",
    customerName: "Nusrat Jahan",
    customerEmail: "nusrat@example.com",
    phone: "01711000000",
    orderStatus: "PAID",
    paymentStatus: "PAID",
    placedAt: "2026-10-05T10:00:00.000Z",
  };

  it("matches phone, status and an inclusive date range", () => {
    expect(matchesAdminOrderFilters(order, { q: "01711", status: "PAID", from: "2026-10-05", to: "2026-10-05" })).toBe(true);
  });

  it("rejects other statuses and dates", () => {
    expect(matchesAdminOrderFilters(order, { status: "SHIPPED" })).toBe(false);
    expect(matchesAdminOrderFilters(order, { from: "2026-10-06" })).toBe(false);
  });
});
