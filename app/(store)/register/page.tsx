import type { Metadata } from "next";

import {
  AuthFormShell,
  AuthSwitchLinks,
} from "@/components/auth/auth-form-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <AuthFormShell
      title="Create account"
      description="Register for Robonautshop. This page is a UI shell until auth is wired."
      footer={<AuthSwitchLinks mode="register" />}
    >
      <RegisterForm />
    </AuthFormShell>
  );
}
