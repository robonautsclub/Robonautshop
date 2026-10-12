"use server";

import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  setCouponActive,
  validateCoupon,
  type CouponRecord,
} from "@/lib/coupons/queries";
import { couponSchema, type CouponInput } from "@/lib/coupons/schemas";
import { limitAction } from "@/lib/rate-limit/action";

export type AdminCouponResult =
  | { ok: true; coupon: CouponRecord }
  | { ok: false; error: string };

export async function listCouponsAction(): Promise<CouponRecord[]> {
  await requirePermission("coupons.manage");
  const db = await getRequestDb();
  return listCoupons(db);
}

/** Admin-only — requirePermission("coupons.manage") redirects/403s non-admins itself. */
export async function createCouponAction(input: CouponInput): Promise<AdminCouponResult> {
  const session = await requirePermission("coupons.manage");

  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid coupon." };
  }

  const db = await getRequestDb();
  const coupon = await createCoupon(db, parsed.data);
  await recordAudit(db, {
    actor: session.user,
    action: "coupon.create",
    entityType: "coupon",
    entityId: coupon.id,
    after: { code: coupon.code, type: coupon.type, value: coupon.value },
  });
  revalidatePath("/admin/coupons");
  return { ok: true, coupon };
}

export async function toggleCouponActiveAction(
  id: string,
  active: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requirePermission("coupons.manage");
  const db = await getRequestDb();
  await setCouponActive(db, id, active);
  await recordAudit(db, { actor: session.user, action: "coupon.toggle", entityType: "coupon", entityId: id, after: { active } });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCouponAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requirePermission("coupons.manage");
  const db = await getRequestDb();
  await deleteCoupon(db, id);
  await recordAudit(db, { actor: session.user, action: "coupon.delete", entityType: "coupon", entityId: id });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export type PreviewCouponResult =
  | { ok: true; discountAmount: number; code: string }
  | { ok: false; error: string };

/** Customer-facing checkout preview — the same validateCoupon() runs again, authoritatively, when the order is actually placed. */
export async function previewCouponAction(
  code: string,
  subtotal: number,
): Promise<PreviewCouponResult> {
  // Throttle code guessing; keyed by IP since checkout preview may run before
  // the session is read here.
  const limited = await limitAction("coupon-preview", { limit: 10, windowMs: 60 * 1000 });
  if (limited) {
    return { ok: false, error: limited };
  }

  const db = await getRequestDb();
  const result = await validateCoupon(db, code, subtotal);
  if (!result.ok) {
    return result;
  }
  return { ok: true, discountAmount: result.discountAmount, code: result.coupon.code };
}
