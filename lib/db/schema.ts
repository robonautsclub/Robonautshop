import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Drizzle schema for the D1 database.
 *
 * This file intentionally has no domain tables yet (products, categories,
 * orders, ...) — those are added one at a time in tasks/phase-11-database.
 *
 * `healthChecks` exists only to prove the D1 + Drizzle + migrations
 * pipeline end to end (tasks 62 and 63): generate a migration, apply it,
 * and do a real read/write against it. It is infrastructure, not domain
 * data, and can be dropped once real tables exist.
 */
export const healthChecks = sqliteTable("health_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  checkedAt: text("checked_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
