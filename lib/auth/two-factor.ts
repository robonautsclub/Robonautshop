import { isBackOfficeRole } from "@/lib/auth/permissions";

export const TWO_FACTOR_SETUP_PATH = "/login/two-factor-setup";

/**
 * Admin and staff accounts must have TOTP two-factor enabled (task 148);
 * customers are unaffected. Local development can opt out with
 * ADMIN_2FA_REQUIRED=false — the flag is ignored in production builds.
 */
export function twoFactorRequired(
  user: { role?: string | null; twoFactorEnabled?: boolean | null },
  env: { NODE_ENV?: string; ADMIN_2FA_REQUIRED?: string } = process.env,
): boolean {
  if (!isBackOfficeRole(user.role)) return false;
  if (env.NODE_ENV !== "production" && env.ADMIN_2FA_REQUIRED === "false") return false;
  return user.twoFactorEnabled !== true;
}
