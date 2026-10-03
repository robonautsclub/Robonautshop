import type { Metadata } from "next";

import {
  AuthFormShell,
  AuthSwitchLinks,
} from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthFormShell
      title="Sign in"
      description="Access your Robonautshop account. This page is a UI shell until auth is wired."
      footer={<AuthSwitchLinks mode="login" />}
    >
      <LoginForm />
    </AuthFormShell>
  );
}
