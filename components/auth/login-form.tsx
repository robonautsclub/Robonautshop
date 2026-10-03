"use client";

import { type FormEvent, useState } from "react";

import {
  AuthComingSoonNote,
  fieldClassName,
} from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/lib/auth/schemas";

type FieldErrors = Partial<Record<"email" | "password" | "form", string>>;

export function LoginForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "email" || key === "password") {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus(
      "Validation passed. Sign-in is not connected yet — no session was created.",
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <AuthComingSoonNote />

      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          className={fieldClassName(Boolean(errors.email))}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          className={fieldClassName(Boolean(errors.password))}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full">
        Sign in (demo UI)
      </Button>

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}
