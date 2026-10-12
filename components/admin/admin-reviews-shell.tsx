"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-table";
import { useAdminSave } from "@/components/admin/use-admin-save";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/reviews/star-rating";
import { moderateReviewAction } from "@/lib/reviews/admin-actions";
import type { AdminReview } from "@/lib/reviews/queries";

const STATUS_TONE = { PENDING: "warning", APPROVED: "success", HIDDEN: "neutral" } as const;

function ReviewRow({ review }: { review: AdminReview }) {
  const save = useAdminSave();

  return (
    <li className="space-y-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <a href={`/products/${review.productSlug}`} className="font-medium text-foreground hover:underline">
            {review.productName}
          </a>{" "}
          · {review.authorName} · {new Date(review.createdAt).toLocaleDateString()}
        </p>
        <AdminStatusBadge tone={STATUS_TONE[review.status]}>{review.status}</AdminStatusBadge>
      </div>
      <div className="flex items-center gap-2">
        <StarRating value={review.rating} />
        {review.title ? <span className="text-sm font-medium">{review.title}</span> : null}
      </div>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{review.body}</p>
      <div className="flex flex-wrap gap-2">
        {review.status !== "APPROVED" ? (
          <Button
            type="button"
            size="sm"
            disabled={save.pending}
            onClick={() => void save.run(() => moderateReviewAction(review.id, "APPROVED"), "Review approved.")}
          >
            Approve
          </Button>
        ) : null}
        {review.status !== "HIDDEN" ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={save.pending}
            onClick={() => void save.run(() => moderateReviewAction(review.id, "HIDDEN"), "Review hidden.")}
          >
            Hide
          </Button>
        ) : null}
      </div>
      {save.error ? (
        <p className="text-sm text-destructive" role="alert">
          {save.error}
        </p>
      ) : null}
      {save.status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {save.status}
        </p>
      ) : null}
    </li>
  );
}

export function AdminReviewsShell({ reviews }: { reviews: AdminReview[] }) {
  const pending = reviews.filter((review) => review.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reviews"
        description={`${reviews.length} reviews · ${pending} awaiting approval. Only approved reviews appear on product pages and count toward ratings.`}
      />
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <ReviewRow key={review.id} review={review} />
          ))}
        </ul>
      )}
    </div>
  );
}
