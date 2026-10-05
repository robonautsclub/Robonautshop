import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config for the D1 database (see wrangler.jsonc > d1_databases).
 *
 * Only `drizzle-kit generate` is used here — it diffs lib/db/schema.ts
 * against the migrations already in ./migrations and writes new SQL files.
 * No live database credentials are needed for that, so none are configured.
 *
 * Applying migrations (local or remote) is done with Wrangler, not
 * drizzle-kit, so D1's own migration tracking (`d1_migrations` table) stays
 * authoritative:
 *   wrangler d1 migrations apply robonautsshop-db --local
 *   wrangler d1 migrations apply robonautsshop-db --remote
 */
export default defineConfig({
  dialect: "sqlite",
  schema: "./lib/db/schema/index.ts",
  out: "./migrations",
});
