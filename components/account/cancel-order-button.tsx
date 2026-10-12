"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cancelMyOrderAction } from "@/lib/server-cart/actions";

/**
 * Two-step cancel with an inline confirmation. Show it only when
 * canCustomerCancelOrder() is true; the server re-checks ownership and status.
 */
export function CancelOrderButton({ orderId, isPaid }: { orderId: string; isPaid: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await cancelMyOrderAction(orderId);
      if (!result.ok) {
        setError(result.error);
        setConfirming(false);
        return;
      }
      router.refresh();
    });
  }

  if (!confirming) {
    return (
      <div className="space-y-2">
        <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
          Cancel order
        </Button>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3" role="alertdialog" aria-labelledby={`cancel-${orderId}`}>
      <p id={`cancel-${orderId}`} className="text-sm font-medium">
        Cancel this order?
      </p>
      <p className="text-sm text-muted-foreground">
        {isPaid
          ? "You have already paid with bKash. Our team will refund you manually."
          : "Reserved items will be released."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
          {isPending ? "Cancelling…" : "Yes, cancel order"}
        </Button>
        <Button type="button" variant="outline" disabled={isPending} onClick={() => setConfirming(false)}>
          Keep order
        </Button>
      </div>
    </div>
  );
}
