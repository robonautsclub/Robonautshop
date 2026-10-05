"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth/session";
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

export type AdminCouponResult =
  | { ok: true; coupon: CouponRecord }
  | { ok: false; error: string };

export async function listCouponsAction(): Promise<CouponRecord[]> {
  await requireAdminSession();
  const db = await getRequestDb();
  return listCoupons(db);
}

/** Admin-only — requireAdminSession() redirects/403s non-admins itself. */
export async function createCouponAction(input: CouponInput): Promise<AdminCouponResult> {
  await requireAdminSession();

  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid coupon." };
  }

  const db = await getRequestDb();
  const coupon = await createCoupon(db, parsed.data);
  revalidatePath("/admin/coupons");
  return { ok: true, coupon };
}

export async function toggleCouponActiveAction(
  id: string,
  active: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminSession();
  const db = await getRequestDb();
  await setCouponActive(db, id, active);
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCouponAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminSession();
  const db = await getRequestDb();
  await deleteCoupon(db, id);
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
  const db = await getRequestDb();
  const result = await validateCoupon(db, code, subtotal);
  if (!result.ok) {
    return result;
  }
  return { ok: true, discountAmount: result.discountAmount, code: result.coupon.code };
}
