"use client";

import { Star } from "lucide-react";
import { type FormEvent, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { submitReviewAction } from "@/lib/reviews/actions";
import { type ReviewInput, reviewSchema } from "@/lib/reviews/schemas";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<Record<keyof ReviewInput | "form", string>>;

type ReviewFormProps = {
  productSlug: string;
  initial?: { rating: number; title: string | null; body: string } | null;
  onSubmitted?: () => void;
};

export function ReviewForm({ productSlug, initial, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const formData = new FormData(event.currentTarget);
    const parsed = reviewSchema.safeParse({
      rating,
      title: formData.get("title") || undefined,
      body: formData.get("body"),
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "rating" || key === "title" || key === "body") {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    const result = await submitReviewAction(productSlug, parsed.data);
    setSubmitting(false);

    if (!result.ok) {
      setErrors({ form: result.error, ...result.fieldErrors });
      return;
    }

    setStatus(initial ? "Review updated." : "Thanks for your review!");
    onSubmitted?.();
  }

  const displayRating = hoverRating || rating;

  return (
    <form className="space-y-4 rounded-xl border p-4" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <span className="text-sm font-medium">Your rating</span>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              className="p-0.5"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "size-6",
                  star <= displayRating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-none text-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </div>
        {errors.rating ? <p className="text-sm text-destructive">{errors.rating}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-title" className="text-sm font-medium">
          Title (optional)
        </label>
        <input
          id="review-title"
          name="title"
          defaultValue={initial?.title ?? ""}
          className={fieldClassName(Boolean(errors.title))}
        />
        {errors.title ? <p className="text-sm text-destructive">{errors.title}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-body" className="text-sm font-medium">
          Review
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={4}
          defaultValue={initial?.body ?? ""}
          className={cn(fieldClassName(Boolean(errors.body)), "min-h-24 resize-y")}
        />
        {errors.body ? <p className="text-sm text-destructive">{errors.body}</p> : null}
      </div>

      {errors.form ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.form}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : initial ? "Update review" : "Submit review"}
      </Button>

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}
