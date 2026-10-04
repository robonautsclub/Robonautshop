import { getCloudflareContext } from "@opennextjs/cloudflare";

import { createDb, type Database } from "@/lib/db";

/**
 * The one authoritative way server code (Server Components, Route Handlers,
 * Server Actions) gets a request-bound D1 client. Never construct a
 * Drizzle client any other way — there is one `DB` binding per request,
 * not a module-level singleton (see wrangler.jsonc).
 *
 * Works locally too: `initOpenNextCloudflareForDev()` in next.config.ts
 * wires up a local D1 binding for `next dev`.
 */
export async function getRequestDb(): Promise<Database> {
  const { env } = await getCloudflareContext({ async: true });
  return createDb(env.DB);
}
