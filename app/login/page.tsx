import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Admin sign-in",
  robots: { index: false, follow: false },
};

/**
 * Admin sign-in. Customers use /user/login instead; staff navigate here
 * manually. Intentionally outside both the (store) and admin route groups,
 * so it gets neither the storefront nor the admin chrome.
 */
export default function AdminLoginPage() {
  return (
    <AuthFormShell
      title="Admin sign-in"
      description="Sign in to manage the Robonautshop store."
      closeHref="/"
    >
      <Suspense>
        <LoginForm redirectTo="/admin" />
      </Suspense>
    </AuthFormShell>
  );
}
