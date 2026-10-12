"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { requestReturnAction } from "@/lib/returns/actions";

export type RequestableItem = {
  id: string;
  productName: string;
  /** Units still open for a new request. */
  remaining: number;
};

export type ExistingRequest = {
  id: string;
  productName: string;
  type: string;
  reason: string;
  quantity: number;
  status: string;
  adminNote: string | null;
};

const REASONS: Array<{ value: string; label: string }> = [
  { value: "DEFECTIVE", label: "Defective / not working" },
  { value: "WRONG_ITEM", label: "Wrong item received" },
  { value: "NOT_AS_DESCRIBED", label: "Not as described" },
  { value: "CHANGED_MIND", label: "Changed my mind" },
  { value: "OTHER", label: "Other" },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Waiting for review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

type ReturnRequestSectionProps = {
  items: RequestableItem[];
  requests: ExistingRequest[];
  windowDays: number;
  /** False when the order isn't delivered or the window has passed. */
  canRequest: boolean;
};

/** Return / warranty requests on the order page; the server re-checks every rule. */
export function ReturnRequestSection({ items, requests, windowDays, canRequest }: ReturnRequestSectionProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const available = items.filter((item) => item.remaining > 0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSent(false);
    const form = event.currentTarget;
    const data = new FormData(form);

    setPending(true);
    const result = await requestReturnAction({
      orderItemId: data.get("orderItemId"),
      type: data.get("type"),
      reason: data.get("reason"),
      quantity: data.get("quantity"),
      note: data.get("note") || undefined,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    form.reset();
    setSent(true);
    router.refresh();
  }

  if (!canRequest && requests.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-xl border p-5" aria-labelledby="returns-heading">
      <h2 id="returns-heading" className="text-sm font-semibold tracking-tight">
        Returns &amp; warranty
      </h2>

      {requests.length > 0 ? (
        <ul className="space-y-3 text-sm">
          {requests.map((request) => (
            <li key={request.id} className="rounded-lg border p-3">
              <p className="font-medium">
                {request.productName} × {request.quantity} ·{" "}
                {request.type === "RETURN" ? "Return" : "Warranty claim"}
              </p>
              <p className="text-muted-foreground">
                {STATUS_LABEL[request.status] ?? request.status}
                {request.adminNote ? ` — ${request.adminNote}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {canRequest && available.length > 0 ? (
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit} noValidate>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            You can make a request within {windowDays} days of delivery. Refunds and replacements are
            handled by our team after review.
          </p>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="return-item" className="text-sm font-medium">
              Item
            </label>
            <select id="return-item" name="orderItemId" className={fieldClassName()}>
              {available.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.productName} (up to {item.remaining})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="return-type" className="text-sm font-medium">
              Request type
            </label>
            <select id="return-type" name="type" className={fieldClassName()}>
              <option value="RETURN">Return</option>
              <option value="WARRANTY">Warranty claim</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="return-quantity" className="text-sm font-medium">
              Quantity
            </label>
            <input
              id="return-quantity"
              name="quantity"
              type="number"
              min={1}
              defaultValue={1}
              className={fieldClassName()}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="return-reason" className="text-sm font-medium">
              Reason
            </label>
            <select id="return-reason" name="reason" className={fieldClassName()}>
              {REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="return-note" className="text-sm font-medium">
              Details (optional)
            </label>
            <textarea
              id="return-note"
              name="note"
              rows={3}
              maxLength={1000}
              className={`${fieldClassName()} min-h-20 py-2`}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive sm:col-span-2" role="alert">
              {error}
            </p>
          ) : null}
          {sent ? (
            <p className="text-sm text-muted-foreground sm:col-span-2" role="status">
              Request sent. We’ll review it and update this page.
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Submit request"}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
