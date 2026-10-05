import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AuthProvider } from "@/components/auth/auth-provider";
import { requireAdminSession } from "@/lib/auth/session";

// Admin pages read from D1 (tasks/phase-12-wire-up/75), only reachable at
// request time, not during `next build`'s static prerendering.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "Robonautsshop admin UI shell.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Server-side ADMIN gate for the entire /admin tree
 * (tasks/phase-12-wire-up/79a-admin-route-protection.md). Frontend hiding
 * alone is not enough (AGENTS.md "Authentication") — this runs before any
 * admin page or its data fetches.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminSession();

  return (
    <AuthProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AuthProvider>
  );
}
