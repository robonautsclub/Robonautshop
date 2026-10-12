import { forbidden, redirect } from "next/navigation";
import { headers } from "next/headers";

import { hasPermission, isBackOfficeRole, type Permission } from "@/lib/auth/permissions";
import { getAuth } from "@/lib/auth/server";
import { TWO_FACTOR_SETUP_PATH, twoFactorRequired } from "@/lib/auth/two-factor";

/**
 * The one authoritative way to read the current request's session
 * server-side (Server Components, Server Actions, route handlers outside
 * the Better Auth catch-all itself). Reused by every route guard —
 * tasks/phase-12-wire-up/78a (customer /account), 78b (checkout), and 79a
 * (admin /admin) — so the check lives in exactly one place.
 *
 * Returns null when there is no valid session; never throws for "signed
 * out", only for genuine failures.
 */
export async function getServerSession() {
  const auth = await getAuth();
  return auth.api.getSession({ headers: await headers() });
}

/**
 * The one "is this request allowed into /admin" check
 * (tasks/phase-12-wire-up/79a-admin-route-protection.md). Call this at the
 * top of the admin layout and in any admin Server Action that mutates data
 * — do not re-implement the role check per page.
 *
 * - No session → redirect to the admin login, not the customer one.
 * - Signed in but not ADMIN → 403 (reuses app/forbidden.tsx from task 98).
 *
 * Why this is already "credential-only, no OAuth admin" (the locked rule
 * in 79a) without inspecting *which* provider established this session:
 * `role` only ever becomes "ADMIN" through server-side promotion (task
 * 79b's bootstrap) or by already being ADMIN — social sign-in always
 * defaults new users to CUSTOMER (lib/auth/server.ts,
 * tasks/phase-12-wire-up/77b). So a Google/Microsoft-only account can
 * never carry the ADMIN role in the first place; this role check is
 * sufficient, not a workaround.
 */
export async function requireAdminSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    forbidden();
  }

  return session;
}

/**
 * Any back-office account (ADMIN or a staff role) — the gate for the /admin
 * layout (task 146). It only proves "may enter the admin area"; every page
 * and action still needs requirePermission() for what it does.
 */
export async function requireStaffSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isBackOfficeRole(session.user.role)) {
    forbidden();
  }

  // Back-office accounts must finish two-factor enrollment before any admin access.
  if (twoFactorRequired(session.user)) {
    redirect(TWO_FACTOR_SETUP_PATH);
  }

  return session;
}

/**
 * The one server-side authorization check for admin pages and actions:
 * signed in, back-office role, and the role holds `permission` (see
 * lib/auth/permissions.ts). ADMIN always passes.
 */
export async function requirePermission(permission: Permission) {
  const session = await requireStaffSession();

  if (!hasPermission(session.user.role, permission)) {
    forbidden();
  }

  return session;
}
