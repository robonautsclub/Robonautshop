"use client";

import { useState, useTransition } from "react";

import { fieldClassName } from "@/components/admin/admin-form-dialog";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "@/lib/admin/order-actions";
import type { OrderStatus } from "@/lib/db/schema/shared";
import { cn } from "@/lib/utils";

type AdminOrderStatusControlProps = {
  orderId: string;
  nextStatuses: OrderStatus[];
};

const STATUS_HINTS: Partial<Record<OrderStatus, string>> = {
  SHIPPED: "Shipping removes these items from stock.",
  CANCELLED:
    "Cancelling releases reserved stock. Refund any bKash payment separately — payment status is not changed here.",
};

/** Moves a real D1 order to its next fulfilment status (task 108). */
export function AdminOrderStatusControl({
  orderId,
  nextStatuses,
}: AdminOrderStatusControlProps) {
  const [selected, setSelected] = useState<OrderStatus | "">(nextStatuses[0] ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (nextStatuses.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        This order is in a final state — no further status changes.
      </p>
    );
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, selected);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  const hint = selected ? STATUS_HINTS[selected] : undefined;

  return (
    <form onSubmit={onSubmit} className="space-y-2 border-t pt-3">
      <label htmlFor="order-next-status" className="text-sm font-medium">
        Update order status
      </label>
      <div className="flex flex-wrap gap-2">
        <select
          id="order-next-status"
          value={selected}
          onChange={(event) => setSelected(event.target.value as OrderStatus)}
          className={cn(fieldClassName(), "w-auto min-w-40")}
          disabled={isPending}
        >
          {nextStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" disabled={isPending || !selected}>
          {isPending ? "Updating…" : "Update"}
        </Button>
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}
