"use client";

import { type FormEvent, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

type TwoFactorCodeFormProps = {
  onVerified: () => void;
};

/** Second sign-in step: authenticator code, or a one-time backup code. */
export function TwoFactorCodeForm({ onVerified }: TwoFactorCodeFormProps) {
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const code = String(new FormData(event.currentTarget).get("code") ?? "").trim();
    if (!code) {
      setError(useBackup ? "Enter a backup code." : "Enter the 6-digit code.");
      return;
    }

    setPending(true);
    const { error: verifyError } = useBackup
      ? await authClient.twoFactor.verifyBackupCode({ code })
      : await authClient.twoFactor.verifyTotp({ code });
    setPending(false);

    if (verifyError) {
      setError(verifyError.status === 429 ? "Too many attempts. Please wait a minute." : "That code didn’t work. Try again.");
      return;
    }
    onVerified();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="two-factor-code" className="text-sm font-medium">
          {useBackup ? "Backup code" : "Authenticator code"}
        </label>
        <input
          id="two-factor-code"
          name="code"
          inputMode={useBackup ? "text" : "numeric"}
          autoComplete="one-time-code"
          autoFocus
          className={fieldClassName(Boolean(error))}
          aria-invalid={Boolean(error)}
        />
        <p className="text-xs text-muted-foreground">
          {useBackup
            ? "Each backup code works once."
            : "Open your authenticator app and enter the current 6-digit code."}
        </p>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Verifying…" : "Verify"}
      </Button>
      <button
        type="button"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={() => {
          setUseBackup((value) => !value);
          setError(null);
        }}
      >
        {useBackup ? "Use authenticator code instead" : "Use a backup code instead"}
      </button>
    </form>
  );
}
