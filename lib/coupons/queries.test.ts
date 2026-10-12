import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createCoupon, incrementCouponUsage, validateCoupon } from "@/lib/coupons/queries";
import type { Database } from "@/lib/db";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  await createCoupon(db, { code: "robo10", type: "PERCENT", value: 10, active: true });
  await createCoupon(db, { code: "FLAT500", type: "FIXED", value: 500, active: true });
  await createCoupon(db, {
    code: "BIG",
    type: "FIXED",
    value: 200,
    minSubtotal: 3000,
    active: true,
  });
  await createCoupon(db, {
    code: "OLD",
    type: "PERCENT",
    value: 5,
    active: true,
    expiresAt: "2020-01-01T00:00:00.000Z",
  });
  await createCoupon(db, { code: "OFF", type: "PERCENT", value: 5, active: false });
  await createCoupon(db, { code: "ONCE", type: "FIXED", value: 50, maxUses: 1, active: true });
});

afterAll(async () => {
  await dispose();
});

describe("validateCoupon", () => {
  it("applies a percent discount, rounded to whole taka, case-insensitively", async () => {
    const result = await validateCoupon(db, "  Robo10 ", 1255);
    expect(result).toMatchObject({ ok: true, discountAmount: 126 });
  });

  it("caps a fixed discount at the subtotal", async () => {
    expect(await validateCoupon(db, "FLAT500", 2000)).toMatchObject({ discountAmount: 500 });
    expect(await validateCoupon(db, "FLAT500", 300)).toMatchObject({ discountAmount: 300 });
  });

  it("enforces the minimum subtotal", async () => {
    expect(await validateCoupon(db, "BIG", 2999)).toMatchObject({ ok: false });
    expect(await validateCoupon(db, "BIG", 3000)).toMatchObject({ ok: true, discountAmount: 200 });
  });

  it("rejects expired, inactive, unknown, and empty codes", async () => {
    for (const code of ["OLD", "OFF", "NOPE", "   "]) {
      expect(await validateCoupon(db, code, 5000)).toMatchObject({ ok: false });
    }
  });

  it("stops working once the usage limit is reached", async () => {
    const first = await validateCoupon(db, "ONCE", 1000);
    expect(first.ok).toBe(true);
    if (first.ok) {
      await incrementCouponUsage(db, first.coupon.id);
    }
    expect(await validateCoupon(db, "ONCE", 1000)).toMatchObject({ ok: false });
  });
});
