import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthFormShell
      title="Sign in"
      description="Use your email and password. New emails create an account automatically."
    >
      <LoginForm />
    </AuthFormShell>
  );
}
