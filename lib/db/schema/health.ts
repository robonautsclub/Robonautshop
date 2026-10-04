import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Proves the D1 + Drizzle + migrations pipeline end to end (see
 * tasks/phase-10-backend-cloudflare, tasks 62 and 63). Infrastructure, not
 * domain data — not part of the catalog/order/robotics domain model.
 */
export const healthChecks = sqliteTable("health_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  checkedAt: text("checked_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});
