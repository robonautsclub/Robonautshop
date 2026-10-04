import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormShell, AuthSwitchLinks } from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";
import { SocialSignInButtons } from "@/components/auth/social-sign-in-buttons";

export const metadata: Metadata = {
  title: "Sign in",
};

/**
 * Customer sign-in — email/password plus Google and Microsoft
 * (tasks/phase-12-wire-up/77d-split-login-uis.md). The storefront "Sign in"
 * link always points here, never at the admin-only /login.
 */
export default function CustomerLoginPage() {
  return (
    <AuthFormShell
      title="Sign in"
      description="Use your email and password, or continue with Google or Microsoft."
      footer={<AuthSwitchLinks mode="login" />}
    >
      <Suspense>
        <div className="space-y-5">
          <LoginForm redirectTo="/account" />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" aria-hidden />
            or
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>
          <SocialSignInButtons redirectTo="/account" />
        </div>
      </Suspense>
    </AuthFormShell>
  );
}
