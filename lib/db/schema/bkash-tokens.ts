import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Cached bKash Checkout (URL) API tokens (task 101).
 *
 * Grant/refresh tokens last ~3600 seconds. Calling grant/refresh more than
 * about twice per hour can block the merchant for an hour, so we persist
 * `id_token` + `refresh_token` in D1 and reuse them until near expiry.
 *
 * Single-row table keyed by product id (e.g. `"checkout_url"`).
 */
export const bkashTokens = sqliteTable("bkash_tokens", {
  id: text("id").primaryKey(),
  idToken: text("id_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  /** Unix ms when `idToken` expires (from bKash `expires_in`). */
  expiresAt: integer("expires_at").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
