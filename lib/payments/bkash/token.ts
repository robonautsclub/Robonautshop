import { eq } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { bkashTokens } from "@/lib/db/schema/bkash-tokens";
import { bkashFetchJsonWithEnv, BkashApiError } from "@/lib/payments/bkash/client";
import {
  BKASH_TOKEN_EXPIRY_BUFFER_MS,
  BKASH_TOKEN_ROW_ID,
  getBkashCheckoutEnv,
} from "@/lib/payments/bkash/config";

type TokenApiResponse = {
  id_token?: string;
  refresh_token?: string;
  expires_in?: string | number;
  token_type?: string;
  statusCode?: string;
  statusMessage?: string;
};

function parseExpiresInSeconds(expiresIn: string | number | undefined): number {
  const value = typeof expiresIn === "string" ? Number.parseInt(expiresIn, 10) : expiresIn;
  if (!value || Number.isNaN(value) || value <= 0) {
    return 3600;
  }
  return value;
}

function isTokenUsable(expiresAtMs: number, nowMs: number): boolean {
  return expiresAtMs - BKASH_TOKEN_EXPIRY_BUFFER_MS > nowMs;
}

async function persistToken(
  db: Database,
  idToken: string,
  refreshToken: string,
  expiresInSeconds: number,
): Promise<void> {
  const now = Date.now();
  const expiresAt = now + expiresInSeconds * 1000;
  const nowIso = new Date(now).toISOString();

  await db
    .insert(bkashTokens)
    .values({
      id: BKASH_TOKEN_ROW_ID,
      idToken,
      refreshToken,
      expiresAt,
      createdAt: nowIso,
      updatedAt: nowIso,
    })
    .onConflictDoUpdate({
      target: bkashTokens.id,
      set: {
        idToken,
        refreshToken,
        expiresAt,
        updatedAt: nowIso,
      },
    });
}

async function grantToken(db: Database): Promise<string> {
  const env = getBkashCheckoutEnv();
  const data = await bkashFetchJsonWithEnv<TokenApiResponse>(env, {
    path: "/tokenized/checkout/token/grant",
    withCredentials: true,
    body: {
      app_key: env.appKey,
      app_secret: env.appSecret,
    },
  });

  if (!data.id_token || !data.refresh_token) {
    throw new BkashApiError(
      data.statusMessage ?? "bKash grant token did not return id_token/refresh_token.",
      data.statusCode,
      data.statusMessage,
    );
  }

  if (data.statusCode && data.statusCode !== "0000") {
    throw new BkashApiError(
      data.statusMessage ?? "bKash grant token failed.",
      data.statusCode,
      data.statusMessage,
    );
  }

  await persistToken(
    db,
    data.id_token,
    data.refresh_token,
    parseExpiresInSeconds(data.expires_in),
  );

  return data.id_token;
}

async function refreshToken(db: Database, currentRefreshToken: string): Promise<string> {
  const env = getBkashCheckoutEnv();
  const data = await bkashFetchJsonWithEnv<TokenApiResponse>(env, {
    path: "/tokenized/checkout/token/refresh",
    withCredentials: true,
    body: {
      app_key: env.appKey,
      app_secret: env.appSecret,
      refresh_token: currentRefreshToken,
    },
  });

  if (!data.id_token || !data.refresh_token) {
    throw new BkashApiError(
      data.statusMessage ?? "bKash refresh token did not return id_token/refresh_token.",
      data.statusCode,
      data.statusMessage,
    );
  }

  if (data.statusCode && data.statusCode !== "0000") {
    throw new BkashApiError(
      data.statusMessage ?? "bKash refresh token failed.",
      data.statusCode,
      data.statusMessage,
    );
  }

  await persistToken(
    db,
    data.id_token,
    data.refresh_token,
    parseExpiresInSeconds(data.expires_in),
  );

  return data.id_token;
}

/**
 * Returns a usable bKash `id_token`, preferring the D1 cache so we do not
 * call grant/refresh on every payment (bKash rate-limits these hard).
 */
export async function getValidBkashIdToken(db: Database): Promise<string> {
  const now = Date.now();
  const rows = await db
    .select()
    .from(bkashTokens)
    .where(eq(bkashTokens.id, BKASH_TOKEN_ROW_ID))
    .limit(1);
  const cached = rows[0];

  if (cached && isTokenUsable(cached.expiresAt, now)) {
    return cached.idToken;
  }

  if (cached?.refreshToken) {
    try {
      return await refreshToken(db, cached.refreshToken);
    } catch {
      // Refresh can fail after ~28 days or if bKash invalidates — fall back to grant.
    }
  }

  return grantToken(db);
}
