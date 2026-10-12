"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

export function ResendVerificationNotice({ email }: { email: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function resend() {
    setPending(true);
    setMessage(null);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/user/verify-email",
    });
    setPending(false);

    if (error) {
      console.error("[auth] sendVerificationEmail failed:", error);
      setMessage(
        error.status === 429
          ? "Too many attempts. Please wait a minute and try again."
          : "Could not send the email. Please try again.",
      );
      return;
    }
    setMessage("Verification email sent. Check your inbox.");
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
      <p className="flex-1">
        Your email isn’t verified yet. Verify it to place orders.
      </p>
      <Button type="button" variant="outline" size="sm" onClick={resend} disabled={pending}>
        {pending ? "Sending…" : "Resend link"}
      </Button>
      {message ? (
        <p className="w-full text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
