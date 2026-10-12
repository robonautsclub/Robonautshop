import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { getPlatformProxy } from "wrangler";

import { createDb, type Database } from "@/lib/db";

/**
 * Test-only helper: a real, in-memory local D1 database (wrangler's
 * getPlatformProxy — the same workerd runtime `wrangler dev` uses, with
 * `persist: false` so nothing touches .wrangler/state) with every migration
 * in ./migrations applied.
 * Lets business-rule tests run real SQL instead of mocking the queries they
 * are meant to check. Never imported by app code.
 */
export async function createTestDb(): Promise<{
  db: Database;
  dispose: () => Promise<void>;
}> {
  const proxy = await getPlatformProxy<{ DB: D1Database }>({ persist: false });
  const d1 = proxy.env.DB;

  const migrationsDir = join(process.cwd(), "migrations");
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const statements = readFileSync(join(migrationsDir, file), "utf8")
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await d1.prepare(statement).run();
    }
  }

  return {
    db: createDb(d1),
    dispose: () => proxy.dispose(),
  };
}
