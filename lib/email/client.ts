import { Resend } from "resend";

/**
 * Resend client for transactional mail. Returns null when `RESEND_API_KEY`
 * is unset so callers can skip send in local/dev without crashing.
 *
 * Set the key in `.env` (never commit it). Replace any placeholder like
 * `re_xxxxxxxxx` with your real Resend API key from the dashboard.
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey === "re_xxxxxxxxx") {
    return null;
  }
  return new Resend(apiKey);
}

/** Verified sender — defaults to Resend's onboarding address for testing. */
export function getResendFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Robonautshop <onboarding@resend.dev>"
  );
}
