import { Hono } from "hono";

import { createDb } from "@/lib/db";
import { healthChecks } from "@/lib/db/schema";

/**
 * Cloudflare bindings this API layer actually uses (see wrangler.jsonc).
 * Kept narrow and explicit rather than pulling in the full generated
 * CloudflareEnv (which also carries unrelated secrets like
 * BETTER_AUTH_SECRET), and does not depend on `pnpm cf:typegen` having been
 * run — see types/cloudflare.d.ts for the underlying runtime types.
 */
type Bindings = {
  DB: D1Database;
};

/**
 * The Cloudflare Workers API entry point.
 *
 * This is the single Hono app mounted at `/api` (see
 * `app/api/[[...route]]/route.ts`). It runs inside the same Worker as the
 * rest of the Next.js app (see `wrangler.jsonc` / `open-next.config.ts`).
 *
 * Business routes (products, categories, orders, ...) are added here in
 * later tasks, one resource at a time — see tasks/phase-10-backend-cloudflare
 * and tasks/phase-11-database. Each route should stay thin and delegate to a
 * service/repository module rather than querying the database directly.
 */
export const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
);

// Smoke check: proves the D1 binding + Drizzle + migration pipeline work
// end to end (a real write, then a real read) rather than just "the file
// compiles". See tasks/phase-10-backend-cloudflare/63-test-database-connection.
app.get("/health/db", async (c) => {
  const db = createDb(c.env.DB);

  try {
    await db.insert(healthChecks).values({}).run();
    const rows = await db.select().from(healthChecks).all();

    return c.json({
      status: "ok",
      checksRecorded: rows.length,
      latestCheck: rows.at(-1) ?? null,
    });
  } catch (error) {
    console.error("D1 health check failed", error);
    return c.json({ status: "error", message: "Database check failed." }, 500);
  }
});
