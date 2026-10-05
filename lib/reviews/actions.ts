"use server";

import { revalidatePath } from "next/cache";

import { getServerSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { getProductBySlug } from "@/lib/catalog/queries";
import { reviewSchema, type ReviewInput } from "@/lib/reviews/schemas";
import {
  deleteReview,
  getMyReviewForProduct,
  upsertReview,
  type ProductReviewRecord,
} from "@/lib/reviews/queries";

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user.id ?? null;
}

export type SubmitReviewResult =
  | { ok: true; review: ProductReviewRecord }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof ReviewInput, string>> };

/** Server-side validated review create/update — never trusts client-side validation alone. */
export async function submitReviewAction(
  productSlug: string,
  input: ReviewInput,
): Promise<SubmitReviewResult> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "You must be signed in to leave a review." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ReviewInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "rating" || key === "title" || key === "body") {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const db = await getRequestDb();
  const product = await getProductBySlug(db, productSlug);
  if (!product) {
    return { ok: false, error: "Product not found." };
  }

  const review = await upsertReview(db, {
    userId,
    productId: product.id,
    rating: parsed.data.rating,
    title: parsed.data.title,
    body: parsed.data.body,
  });

  revalidatePath(`/products/${product.slug}`);
  return { ok: true, review };
}

export async function getMyReviewForProductAction(
  productId: string,
): Promise<ProductReviewRecord | null> {
  const userId = await requireUserId();
  if (!userId) {
    return null;
  }
  const db = await getRequestDb();
  return getMyReviewForProduct(db, userId, productId);
}

export async function deleteMyReviewAction(
  reviewId: string,
  productSlugForRevalidate?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "You must be signed in to remove a review." };
  }

  const db = await getRequestDb();
  const deleted = await deleteReview(db, userId, reviewId);
  if (!deleted) {
    return { ok: false, error: "Review not found." };
  }

  if (productSlugForRevalidate) {
    revalidatePath(`/products/${productSlugForRevalidate}`);
  }
  return { ok: true };
}
