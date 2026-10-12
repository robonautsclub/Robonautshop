"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePermission } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { REVIEW_STATUS_VALUES } from "@/lib/db/schema/product-reviews";
import { setReviewStatus } from "@/lib/reviews/queries";

const moderationSchema = z.object({
  reviewId: z.string().trim().min(1),
  status: z.enum(REVIEW_STATUS_VALUES),
});

export type ModerateReviewResult = { ok: true } | { ok: false; error: string };

/** Admin-only approve / hide. */
export async function moderateReviewAction(
  reviewId: string,
  status: string,
): Promise<ModerateReviewResult> {
  await requirePermission("reviews.moderate");
  const parsed = moderationSchema.safeParse({ reviewId, status });
  if (!parsed.success) {
    return { ok: false, error: "Invalid moderation request." };
  }

  const db = await getRequestDb();
  const result = await setReviewStatus(db, parsed.data.reviewId, parsed.data.status);
  if (!result.ok) {
    return result;
  }
  revalidatePath("/admin/reviews");
  if (result.productSlug) revalidatePath(`/products/${result.productSlug}`);
  return { ok: true };
}
