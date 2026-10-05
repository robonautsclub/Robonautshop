"use client";

import { useRouter } from "next/navigation";

import { ReviewForm } from "@/components/reviews/review-form";

export function ReviewFormClient({
  productSlug,
  initial,
}: {
  productSlug: string;
  initial: { rating: number; title: string | null; body: string } | null;
}) {
  const router = useRouter();

  return (
    <ReviewForm
      productSlug={productSlug}
      initial={initial}
      onSubmitted={() => router.refresh()}
    />
  );
}
