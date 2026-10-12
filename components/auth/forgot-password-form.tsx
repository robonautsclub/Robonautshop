"use client";

import { type FormEvent, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { forgotPasswordSchema } from "@/lib/auth/schemas";
import { authClient } from "@/lib/auth/client";

/** Same success message whether or not the email is registered. */
export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({
      email: new FormData(event.currentTarget).get("email"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setPending(true);
    const { error: requestError } = await authClient.requestPasswordReset({
      email: parsed.data.email,
      redirectTo: "/user/reset-password",
    });
    setPending(false);

    // Only surface rate limiting; every other outcome looks the same to the user.
    if (requestError?.status === 429) {
      setError("Too many attempts. Please wait a minute and try again.");
      return;
    }
    if (requestError) {
      console.error("[auth] requestPasswordReset failed:", requestError);
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-sm" role="status">
        If an account exists for that email, we’ve sent a link to reset your password. Check your
        inbox (and spam folder).
      </p>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="forgot-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          className={fieldClassName(Boolean(error))}
          aria-invalid={Boolean(error)}
        />
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
