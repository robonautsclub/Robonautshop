"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

type SocialSignInButtonsProps = {
  /** Where Better Auth should send the browser back to after the OAuth round trip. */
  redirectTo: string;
};

/**
 * Customer-only social sign-in (Google, Microsoft) — see
 * tasks/phase-12-wire-up/77d-split-login-uis.md. Never render this on the
 * admin `/login` page: admins authenticate with email/password only
 * (tasks/phase-12-wire-up/79a-admin-route-protection.md).
 *
 * Requires GOOGLE_CLIENT_ID/SECRET and MICROSOFT_CLIENT_ID/SECRET to be set
 * (lib/auth/server.ts only registers a provider when both are present) —
 * without real OAuth app credentials these buttons will error, which is
 * expected in local dev.
 */
export function SocialSignInButtons({ redirectTo }: SocialSignInButtonsProps) {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const callbackURL = searchParams.get("callbackUrl") || redirectTo;

  async function signInWith(provider: "google" | "microsoft") {
    setError(null);
    const { error: signInError } = await authClient.signIn.social({
      provider,
      callbackURL,
    });

    if (signInError) {
      setError(signInError.message ?? `Could not start ${provider} sign-in.`);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => void signInWith("google")}
      >
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => void signInWith("microsoft")}
      >
        Continue with Microsoft
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
