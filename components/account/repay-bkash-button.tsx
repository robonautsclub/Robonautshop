"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { repayBkashOrderAction } from "@/lib/server-cart/actions";

/**
 * "Pay again with bKash" for an unpaid order — shared by the orders list and
 * the order detail page. Show it only when canRepayWithBkash() is true; the
 * server re-checks that rule, prices, and stock before redirecting.
 */
export function RepayBkashButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onRepay() {
    setError(null);
    startTransition(async () => {
      const result = await repayBkashOrderAction(orderId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.assign(result.redirectUrl);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={isPending} onClick={onRepay}>
          {isPending ? "Starting bKash…" : "Pay again with bKash"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.refresh()}>
          Refresh
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
