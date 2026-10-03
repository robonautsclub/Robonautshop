"use client";

import { type FormEvent, useState } from "react";

import {
  AuthComingSoonNote,
  fieldClassName,
} from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/lib/auth/schemas";

type FieldErrors = Partial<
  Record<"name" | "email" | "password" | "confirmPassword" | "form", string>
>;

export function RegisterForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const formData = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (
          key === "name" ||
          key === "email" ||
          key === "password" ||
          key === "confirmPassword"
        ) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus(
      "Validation passed. Account creation is not connected yet — no account was created.",
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <AuthComingSoonNote />

      <div className="space-y-1.5">
        <label htmlFor="register-name" className="text-sm font-medium">
          Full name
        </label>
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          className={fieldClassName(Boolean(errors.name))}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="register-email"
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
        <label htmlFor="register-password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          className={fieldClassName(Boolean(errors.password))}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-confirm" className="text-sm font-medium">
          Confirm password
        </label>
        <input
          id="register-confirm"
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

      <Button type="submit" className="w-full">
        Create account (demo UI)
      </Button>

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}
