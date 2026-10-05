import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { dash, sentinel } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import type { Database } from "@/lib/db";
import { getRequestDb } from "@/lib/db/request";
import * as schema from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/email/send";

/**
 * Social providers are registered only when their env vars are actually
 * set, so a dev environment without real Google/Microsoft OAuth app
 * credentials doesn't break auth construction — email/password still works.
 * See .env.example for the placeholders and
 * tasks/phase-12-wire-up/77b-customer-social-oauth.md for scope: these are
 * for customer sign-in only. Admins use email/password only (enforced in
 * tasks/phase-12-wire-up/79a-admin-route-protection.md, not here) — no
 * admin UI or flow for these is added until task 77d.
 *
 * Callback URLs to register with each provider:
 *   {BETTER_AUTH_URL}/api/auth/callback/google
 *   {BETTER_AUTH_URL}/api/auth/callback/microsoft
 */
function getSocialProviders() {
  const providers: {
    google?: { clientId: string; clientSecret: string };
    microsoft?: { clientId: string; clientSecret: string };
  } = {};

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }

  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    providers.microsoft = {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    };
  }

  return providers;
}

/**
 * Builds a Better Auth instance for a given `db`. Separated from `getAuth()`
 * so the admin bootstrap script (tasks/phase-12-wire-up/79b-admin-
 * bootstrap.md, scripts/bootstrap-admin.ts) can build one too, from a
 * wrangler-proxied `db` instead of a request-bound one — the `nextCookies()`
 * plugin needs an actual Next.js request context, so the script omits it.
 *
 * Table names: the users/sessions/accounts/verifications tables are plural
 * (see lib/db/schema/users.ts), so `usePlural: true`. Table/column *names*
 * are otherwise irrelevant to Better Auth — the adapter matches fields by
 * the schema object's JS property names (id, email, emailVerified, ...),
 * which already match what Better Auth expects.
 *
 * `role` (CUSTOMER | ADMIN) is this project's addition. `input: false` means
 * it can never be set by a signup/update request body — only server-side
 * code (e.g. the task 79b admin bootstrap) can promote a user to ADMIN.
 * Never trust a client-supplied role (AGENTS.md "Authentication").
 */
export function buildAuth(db: Database, options: { withNextCookies: boolean }) {
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          input: false,
          defaultValue: "CUSTOMER",
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // Welcome mail is best-effort — never block signup on Resend.
            void sendWelcomeEmail({ to: user.email, name: user.name });
          },
        },
      },
    },
    socialProviders: getSocialProviders(),
    plugins: [dash(), sentinel(), ...(options.withNextCookies ? [nextCookies()] : [])],
  });
}

/**
 * The one authoritative Better Auth server instance for use inside Next.js
 * (Server Components, Route Handlers, Server Actions).
 *
 * This is a factory, not a module-level singleton, because the D1 binding
 * (`env.DB`) is only available per request (see lib/db/request.ts) — there
 * is no database connection to build an adapter from at module load time.
 * Call this inside a route handler / server action, once per request.
 */
export async function getAuth() {
  const db = await getRequestDb();
  return buildAuth(db, { withNextCookies: true });
}
