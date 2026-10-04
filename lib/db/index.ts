import { drizzle } from "drizzle-orm/d1";

import * as schema from "@/lib/db/schema";

/**
 * Creates a Drizzle client bound to a specific D1 database instance.
 *
 * Call this with `env.DB` (see wrangler.jsonc) inside a route handler,
 * server action, or Hono route — never at module scope, since the binding
 * is only available once a request is being handled.
 */
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;
