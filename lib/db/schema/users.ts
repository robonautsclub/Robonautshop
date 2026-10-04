import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Users and auth tables, shaped to match what Better Auth needs
 * (https://better-auth.com/docs/concepts/database): a `user`, `session`,
 * `account` (OAuth/credential providers), and `verification` (email
 * verification / password reset tokens) table.
 *
 * Two deliberate departures from Better Auth's own default generator
 * output, both safe because Better Auth's adapters match fields by the JS
 * property name on the schema object you give them, not by table/column
 * name:
 * - Table names are plural (`users`, `sessions`, ...) to match every other
 *   table in this schema. When auth is actually wired in
 *   tasks/phase-12-wire-up/77-real-auth.md, pass `usePlural: true` (or
 *   explicit `modelName`s) to `drizzleAdapter(...)` so Better Auth looks for
 *   these exact table names.
 * - SQL column names are snake_case, matching the rest of this schema,
 *   instead of Better Auth's generator's camelCase.
 *
 * Timestamp columns use `integer(..., { mode: "timestamp" })` (not the
 * `text` ISO-string convention used elsewhere in this schema) because
 * Better Auth's own schema expects real JS `Date` values round-tripped
 * through the adapter — this is what its generator produces for SQLite.
 *
 * `role` is this project's addition for CUSTOMER/ADMIN (see AGENTS.md
 * "Authentication"). Authorization must still be enforced server-side,
 * never inferred from the client.
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  role: text("role", { enum: ["CUSTOMER", "ADMIN"] })
    .notNull()
    .default("CUSTOMER"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // e.g. "credential", "google" — which provider this linked account is for.
    providerId: text("provider_id").notNull(),
    // The provider's own id for this account (user id at Google, etc.).
    accountId: text("account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp",
    }),
    scope: text("scope"),
    // Hashed credential password, only set for providerId = "credential".
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verifications = sqliteTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    // What's being verified — typically an email address.
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);
