/**
 * bKash Checkout (URL) env + constants (task 101).
 * Secrets come from environment — never hard-coded.
 */

export const BKASH_TOKEN_ROW_ID = "checkout_url";

/** Refresh ~5 minutes before expiry so we never send a near-dead token. */
export const BKASH_TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

/** bKash recommends ~30s timeouts for their APIs. */
export const BKASH_FETCH_TIMEOUT_MS = 30_000;

export type BkashCheckoutEnv = {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
};

export function getBkashCheckoutEnv(): BkashCheckoutEnv {
  const baseUrl = process.env.BKASH_CHECKOUT_URL_BASE?.replace(/\/$/, "") ?? "";
  const appKey = process.env.BKASH_CHECKOUT_URL_APP_KEY ?? "";
  const appSecret = process.env.BKASH_CHECKOUT_URL_APP_SECRET ?? "";
  const username = process.env.BKASH_CHECKOUT_URL_USER_NAME ?? "";
  const password = process.env.BKASH_CHECKOUT_URL_PASSWORD ?? "";

  if (!baseUrl || !appKey || !appSecret || !username || !password) {
    throw new Error(
      "bKash Checkout URL is not configured. Set BKASH_CHECKOUT_URL_BASE, APP_KEY, APP_SECRET, USER_NAME, and PASSWORD.",
    );
  }

  return { baseUrl, appKey, appSecret, username, password };
}

export function getBkashCallbackUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is required for the bKash callback URL.");
  }
  return `${siteUrl}/api/payments/bkash/callback`;
}
