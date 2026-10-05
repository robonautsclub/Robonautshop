import Link from "next/link";

import { StarRating } from "@/components/reviews/star-rating";
import { ReviewFormClient } from "@/components/reviews/review-form-client";
import type { ProductReviewWithAuthor } from "@/lib/reviews/queries";

type ProductReviewsSectionProps = {
  productSlug: string;
  reviews: ProductReviewWithAuthor[];
  summary: { count: number; averageRating: number };
  isSignedIn: boolean;
  myReview: { rating: number; title: string | null; body: string } | null;
};

/** Server-rendered reviews list + summary; the form itself is a small client island. */
export function ProductReviewsSection({
  productSlug,
  reviews,
  summary,
  isSignedIn,
  myReview,
}: ProductReviewsSectionProps) {
  return (
    <div className="mt-14">
      <h2 className="text-xl font-semibold tracking-tight">Reviews</h2>

      <div className="mt-3 flex items-center gap-3">
        <StarRating value={summary.averageRating} size="md" />
        <p className="text-sm text-muted-foreground">
          {summary.count === 0
            ? "No reviews yet"
            : `${summary.averageRating.toFixed(1)} out of 5 · ${summary.count} review${summary.count === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="mt-6">
        {isSignedIn ? (
          <ReviewFormClient productSlug={productSlug} initial={myReview} />
        ) : (
          <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
            <Link href="/user/login" className="font-medium underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            to leave a review.
          </p>
        )}
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} />
                  {review.title ? (
                    <span className="text-sm font-medium">{review.title}</span>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {review.authorName} · {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
