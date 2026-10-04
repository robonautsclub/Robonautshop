import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getServerSession } from "@/lib/auth/session";

/**
 * Server-side guard for /account and every nested route (addresses, future
 * orders, ...) — tasks/phase-12-wire-up/78a-protect-account-routes.md.
 * Frontend hiding alone is not enough (AGENTS.md "Authentication").
 *
 * Any signed-in user (CUSTOMER or ADMIN) may pass — this only checks "is
 * there a session", not role. Admin-only gating is a separate concern
 * (tasks/phase-12-wire-up/79a-admin-route-protection.md).
 */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/user/login?callbackUrl=/account");
  }

  return <>{children}</>;
}
