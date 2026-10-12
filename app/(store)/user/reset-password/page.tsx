import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <AuthFormShell title="Reset password" description="Choose a new password for your account.">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthFormShell>
  );
}
