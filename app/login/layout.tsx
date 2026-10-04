import type { ReactNode } from "react";

import { AuthProvider } from "@/components/auth/auth-provider";

/**
 * Admin `/login` sits outside `(store)` and `admin` route groups, so it does
 * not inherit their AuthProvider. LoginForm calls useAuth(), which requires
 * this wrapper.
 *
 * force-dynamic: avoid a stale full-route cache of this page from before the
 * AuthProvider layout existed (static HIT was still crashing the client).
 */
export const dynamic = "force-dynamic";

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
