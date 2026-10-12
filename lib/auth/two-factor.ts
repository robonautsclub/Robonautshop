import { isBackOfficeRole } from "@/lib/auth/permissions";

export const TWO_FACTOR_SETUP_PATH = "/login/two-factor-setup";

/**
 * Admin and staff accounts can be required to use TOTP two-factor (task 148).
 * Enforcement is currently OFF: set ADMIN_2FA_REQUIRED=true to turn it on.
 * Enrollment and the sign-in code step still work for accounts that opt in.
 * Customers are never affected.
 */
export function twoFactorRequired(
  user: { role?: string | null; twoFactorEnabled?: boolean | null },
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.ADMIN_2FA_REQUIRED !== "true") return false;
  if (!isBackOfficeRole(user.role)) return false;
  return user.twoFactorEnabled !== true;
}
