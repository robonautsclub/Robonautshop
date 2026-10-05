import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Admin sign-in",
  robots: { index: false, follow: false },
};

/**
 * Admin-only sign-in — email and password only, never Google/Microsoft
 * (tasks/phase-12-wire-up/77d-split-login-uis.md and
 * tasks/phase-12-wire-up/79a-admin-route-protection.md). Customers use
 * /user/login instead; staff navigate here manually. Intentionally outside
 * both the (store) and admin route groups, so it gets neither the
 * storefront nor the admin chrome.
 */
export default function AdminLoginPage() {
  return (
    <AuthFormShell
      title="Admin sign-in"
      description="Email and password only — no Google or Microsoft."
      closeHref="/"
    >
      <Suspense>
        <LoginForm redirectTo="/admin" />
      </Suspense>
    </AuthFormShell>
  );
}
