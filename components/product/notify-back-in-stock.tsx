"use client";

import { type FormEvent, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { subscribeBackInStockAction } from "@/lib/stock-alerts/actions";

type NotifyBackInStockProps = {
  productId: string;
  variantId: string | null;
};

/** "Notify me" form shown in place of Add to cart while an item is out of stock. */
export function NotifyBackInStock({ productId, variantId }: NotifyBackInStockProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await subscribeBackInStockAction({
      productId,
      variantId: variantId ?? undefined,
      email: new FormData(event.currentTarget).get("email"),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Thanks! We’ll email you once when this is back in stock.
      </p>
    );
  }

  return (
    <form className="space-y-2" onSubmit={onSubmit} noValidate>
      <label htmlFor={`notify-${variantId ?? productId}`} className="text-sm font-medium">
        Email me when it’s back in stock
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={`notify-${variantId ?? productId}`}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={user?.email ?? ""}
          key={user?.email ?? "guest"}
          className={`${fieldClassName(Boolean(error))} max-w-64`}
          aria-invalid={Boolean(error)}
        />
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Saving…" : "Notify me"}
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
