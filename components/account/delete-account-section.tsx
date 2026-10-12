"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { deleteMyAccountAction } from "@/lib/account/deletion-actions";
import { authClient } from "@/lib/auth/client";

export function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const confirmation = String(new FormData(event.currentTarget).get("confirmation") ?? "");

    startTransition(async () => {
      const result = await deleteMyAccountAction(confirmation);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Server already removed every session; this just clears local state.
      await authClient.signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-destructive/40 p-5">
      <h2 className="text-lg font-semibold tracking-tight">Delete account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Removes your profile, addresses, wishlist and cart, and signs you out everywhere. Past
        orders are kept for our records with your personal details removed.
      </p>

      {open ? (
        <form className="mt-4 space-y-3" onSubmit={onSubmit} noValidate>
          <div className="space-y-1.5">
            <label htmlFor="delete-confirmation" className="text-sm font-medium">
              Confirm your password
            </label>
            <p id="delete-confirmation-hint" className="text-xs text-muted-foreground">
              Signed up with Google or Microsoft? Type your account email instead.
            </p>
            <input
              id="delete-confirmation"
              name="confirmation"
              type="password"
              autoComplete="current-password"
              aria-describedby="delete-confirmation-hint"
              className={fieldClassName(Boolean(error))}
              aria-invalid={Boolean(error)}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Deleting…" : "Permanently delete my account"}
            </Button>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
              Keep my account
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="outline" className="mt-4" onClick={() => setOpen(true)}>
          Delete account…
        </Button>
      )}
    </div>
  );
}
