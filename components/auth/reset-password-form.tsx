"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { resetPasswordSchema } from "@/lib/auth/schemas";
import { authClient } from "@/lib/auth/client";

type FieldErrors = Partial<Record<"password" | "confirmPassword" | "form", string>>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  if (!token || searchParams.get("error")) {
    return (
      <div className="space-y-3 text-sm">
        <p role="alert">This reset link is invalid or has expired.</p>
        <Link href="/user/forgot-password" className="font-medium underline underline-offset-4">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-3 text-sm" role="status">
        <p>Your password has been updated.</p>
        <Link href="/user/login" className="font-medium underline underline-offset-4">
          Sign in
        </Link>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "password" || key === "confirmPassword") {
          next[key] ??= issue.message;
        }
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setPending(true);
    const { error } = await authClient.resetPassword({
      newPassword: parsed.data.password,
      token: token as string,
    });
    setPending(false);

    if (error) {
      setErrors({ form: "This reset link is invalid or has expired. Please request a new one." });
      return;
    }
    setDone(true);
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="reset-password" className="text-sm font-medium">
          New password
        </label>
        <input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          className={fieldClassName(Boolean(errors.password))}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? <p className="text-sm text-destructive">{errors.password}</p> : null}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="reset-confirm" className="text-sm font-medium">
          Confirm new password
        </label>
        <input
          id="reset-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={fieldClassName(Boolean(errors.confirmPassword))}
          aria-invalid={Boolean(errors.confirmPassword)}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
        ) : null}
      </div>
      {errors.form ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.form}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
