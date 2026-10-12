import type { Metadata } from "next";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell
      title="Forgot password"
      description="Enter your email and we’ll send you a link to reset your password."
    >
      <ForgotPasswordForm />
    </AuthFormShell>
  );
}
