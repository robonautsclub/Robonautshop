"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { type FormEvent, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

type Step =
  | { name: "password" }
  | { name: "scan"; totpUri: string; qrDataUrl: string; backupCodes: string[] }
  | { name: "backup"; backupCodes: string[] };

/** The base32 secret inside an otpauth:// URI, for typing in by hand. */
function secretFromUri(uri: string): string {
  try {
    return new URL(uri).searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}

export function TwoFactorSetup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: "password" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setPending(true);
    const { data, error: enableError } = await authClient.twoFactor.enable({ password });
    if (enableError || !data || data.method !== "totp") {
      setPending(false);
      setError("That password didn’t work, or two-factor is already set up.");
      return;
    }
    const qrDataUrl = await QRCode.toDataURL(data.totpURI, { margin: 1, width: 192 });
    setPending(false);
    setStep({ name: "scan", totpUri: data.totpURI, qrDataUrl, backupCodes: data.backupCodes ?? [] });
  }

  async function onVerify(event: FormEvent<HTMLFormElement>, backupCodes: string[]) {
    event.preventDefault();
    setError(null);
    const code = String(new FormData(event.currentTarget).get("code") ?? "").trim();
    if (!code) {
      setError("Enter the 6-digit code from your app.");
      return;
    }

    setPending(true);
    const { error: verifyError } = await authClient.twoFactor.verifyTotp({ code });
    setPending(false);
    if (verifyError) {
      setError("That code didn’t match. Check your app and try again.");
      return;
    }
    setStep({ name: "backup", backupCodes });
  }

  if (step.name === "password") {
    return (
      <form className="space-y-4" onSubmit={onStart} noValidate>
        <div className="space-y-1.5">
          <label htmlFor="setup-password" className="text-sm font-medium">
            Confirm your password
          </label>
          <input
            id="setup-password"
            name="password"
            type="password"
            autoComplete="current-password"
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
          {pending ? "Starting…" : "Continue"}
        </Button>
      </form>
    );
  }

  if (step.name === "scan") {
    const secret = secretFromUri(step.totpUri);
    return (
      <form className="space-y-4" onSubmit={(event) => onVerify(event, step.backupCodes)} noValidate>
        <p className="text-sm">Scan this QR code with your authenticator app.</p>
        <Image
          src={step.qrDataUrl}
          alt="QR code for your authenticator app"
          width={192}
          height={192}
          unoptimized
          className="mx-auto rounded-lg border"
        />
        {secret ? (
          <p className="break-all text-center text-xs text-muted-foreground">
            Can’t scan? Enter this key manually: <span className="font-mono">{secret}</span>
          </p>
        ) : null}
        <div className="space-y-1.5">
          <label htmlFor="setup-code" className="text-sm font-medium">
            6-digit code
          </label>
          <input
            id="setup-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
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
          {pending ? "Verifying…" : "Verify and turn on"}
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Two-factor authentication is on.</p>
      <p className="text-sm text-muted-foreground">
        Save these backup codes somewhere safe. Each works once if you lose your phone, and{" "}
        <strong>they won’t be shown again</strong>.
      </p>
      <ul className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3 font-mono text-sm">
        {step.backupCodes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <Button
        type="button"
        className="w-full"
        onClick={() => {
          router.push("/admin");
          router.refresh();
        }}
      >
        I’ve saved them — go to admin
      </Button>
    </div>
  );
}
