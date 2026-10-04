import type { Metadata } from "next";

import { AuthFormShell, AuthSwitchLinks } from "@/components/auth/auth-form-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

/** Customer-only signup. Admin accounts are never created through a public page (see 79b). */
export default function RegisterPage() {
  return (
    <AuthFormShell
      title="Create account"
      description="Customers only — admin accounts are not created here."
      footer={<AuthSwitchLinks mode="register" />}
    >
      <RegisterForm />
    </AuthFormShell>
  );
}
