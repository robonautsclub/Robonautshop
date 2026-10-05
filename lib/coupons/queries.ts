import { desc, eq, sql } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { coupons } from "@/lib/db/schema/coupons";
import type { CouponInput } from "@/lib/coupons/schemas";

export type CouponRecord = typeof coupons.$inferSelect;

export async function listCoupons(db: Database): Promise<CouponRecord[]> {
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function createCoupon(db: Database, input: CouponInput): Promise<CouponRecord> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(coupons).values({
    id,
    code: input.code.trim().toUpperCase(),
    type: input.type,
    value: input.value,
    minSubtotal: input.minSubtotal ?? null,
    maxUses: input.maxUses ?? null,
    usedCount: 0,
    active: input.active,
    expiresAt: input.expiresAt || null,
    createdAt: now,
    updatedAt: now,
  });

  const rows = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  return rows[0]!;
}

export async function setCouponActive(
  db: Database,
  id: string,
  active: boolean,
): Promise<void> {
  await db
    .update(coupons)
    .set({ active, updatedAt: new Date().toISOString() })
    .where(eq(coupons.id, id));
}

export async function deleteCoupon(db: Database, id: string): Promise<void> {
  await db.delete(coupons).where(eq(coupons.id, id));
}

export type CouponValidationResult =
  | { ok: true; coupon: CouponRecord; discountAmount: number }
  | { ok: false; error: string };

/**
 * Server-side coupon validation (tasks/phase-14-advanced/87-coupons.md) —
 * never trusts a client-computed discount (AGENTS.md "Pricing"). Called
 * both for the checkout preview and again, authoritatively, inside
 * placeOrderFromServerCart at order-creation time.
 */
export async function validateCoupon(
  db: Database,
  code: string,
  subtotal: number,
): Promise<CouponValidationResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { ok: false, error: "Enter a coupon code." };
  }

  const rows = await db.select().from(coupons).where(eq(coupons.code, normalized)).limit(1);
  const coupon = rows[0];

  if (!coupon || !coupon.active) {
    return { ok: false, error: "That coupon code isn't valid." };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { ok: false, error: "That coupon has expired." };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, error: "That coupon has reached its usage limit." };
  }

  if (coupon.minSubtotal !== null && subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      error: `This coupon requires a subtotal of at least ৳${coupon.minSubtotal}.`,
    };
  }

  const discountAmount =
    coupon.type === "PERCENT"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return { ok: true, coupon, discountAmount };
}

/** Called once, at order-creation time, after validateCoupon succeeds. */
export async function incrementCouponUsage(db: Database, couponId: string): Promise<void> {
  await db
    .update(coupons)
    .set({ usedCount: sql`${coupons.usedCount} + 1`, updatedAt: new Date().toISOString() })
    .where(eq(coupons.id, couponId));
}
