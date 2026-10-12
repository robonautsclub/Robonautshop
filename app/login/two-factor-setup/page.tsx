import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { isBackOfficeRole } from "@/lib/auth/permissions";
import { getServerSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Set up two-factor authentication",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Enrollment page for admin and staff accounts (task 148). Lives outside the
 * /admin tree on purpose: the admin gate sends accounts without 2FA here, so
 * it can't be behind that same gate.
 */
export default async function TwoFactorSetupPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }
  if (!isBackOfficeRole(session.user.role)) {
    redirect("/");
  }
  if (session.user.twoFactorEnabled) {
    redirect("/admin");
  }

  return (
    <AuthFormShell
      title="Set up two-factor authentication"
      description="Admin and staff accounts need an authenticator app (Google Authenticator, Authy, 1Password…) before they can use the admin area."
    >
      <TwoFactorSetup />
    </AuthFormShell>
  );
}
