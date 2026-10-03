"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/lib/auth/schemas";

type FieldErrors = Partial<Record<"email" | "password" | "form", string>>;

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
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
    const result = signIn(parsed.data);

    if (!result.ok) {
      setErrors({ form: result.error });
      setStatus("Not signed in.");
      return;
    }

    setStatus(
      result.created
        ? "Account created and signed in."
        : "Signed in successfully.",
    );
    router.push("/account");
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Demo auth is local to this browser. If the email is new, an account is
        created automatically. If the email already exists, the password must
        match or you stay signed out.
      </p>

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

      {errors.form ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.form}
        </p>
      ) : null}

      <Button type="submit" className="w-full">
        Sign in
      </Button>

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}
