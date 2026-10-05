/**
 * Creates (or promotes) an ADMIN user in the local D1 database, email and
 * password only (tasks/phase-12-wire-up/79b-admin-bootstrap.md).
 *
 * Not a public page — deliberately a one-time CLI script, run by whoever
 * has access to the environment's secrets, never exposed over HTTP. Goes
 * through Better Auth's own sign-up (`auth.api.signUpEmail`) so the
 * password is hashed exactly the way a real sign-in expects, then promotes
 * the resulting row to ADMIN directly (the only way `role` ever becomes
 * ADMIN — see lib/auth/server.ts).
 *
 * For the deployed (remote) database: there is no reliable way to run this
 * exact script against remote D1 yet (wrangler's remote-bindings support is
 * still unstable as of this writing). Instead:
 *   1. Sign up normally as a customer at https://<your-domain>/register
 *      (this hashes the password correctly, for real, in production).
 *   2. Promote that account with a plain SQL update — no password handling
 *      needed, so this is the fully reliable path:
 *        wrangler d1 execute robonautsshop-db --remote \
 *          --command="UPDATE users SET role='ADMIN' WHERE email='you@example.com';"
 *
 * Usage (local):
 *   ADMIN_BOOTSTRAP_EMAIL=you@example.com ADMIN_BOOTSTRAP_PASSWORD='...' \
 *     pnpm admin:bootstrap
 *
 * Safe to re-run: if the email already has a local account, it's promoted
 * to ADMIN instead of failing. Never commit real values for the two env
 * vars above — see .env.example for the placeholders.
 */
import { eq } from "drizzle-orm";
import { getPlatformProxy } from "wrangler";

import { buildAuth } from "../lib/auth/server";
import { createDb } from "../lib/db";
import { users } from "../lib/db/schema/users";

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    console.error(
      "Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD before running this script.",
    );
    process.exitCode = 1;
    return;
  }

  if (password.length < 8) {
    console.error("ADMIN_BOOTSTRAP_PASSWORD must be at least 8 characters.");
    process.exitCode = 1;
    return;
  }

  const proxy = await getPlatformProxy<{ DB: D1Database }>({ persist: true });

  try {
    const db = createDb(proxy.env.DB);
    const auth = buildAuth(db, { withNextCookies: false });

    const existing = await db.select().from(users).where(eq(users.email, email));

    if (existing.length > 0) {
      await db
        .update(users)
        .set({ role: "ADMIN", updatedAt: new Date() })
        .where(eq(users.email, email));
      console.log(`Promoted existing local user ${email} to ADMIN.`);
      return;
    }

    await auth.api.signUpEmail({ body: { name: "Admin", email, password } });
    await db
      .update(users)
      .set({ role: "ADMIN", updatedAt: new Date() })
      .where(eq(users.email, email));
    console.log(`Created ADMIN user ${email} in the local database.`);
  } finally {
    await proxy.dispose();
  }
}

main().catch((error: unknown) => {
  console.error("Admin bootstrap failed:", error);
  process.exitCode = 1;
});
