import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "@/lib/db/schema/users";

/**
 * Append-only record of sensitive admin actions (task 147). Rows are only
 * ever inserted — there is no update or delete code path or UI. `before` and
 * `after` are small JSON snapshots with secrets already redacted
 * (lib/audit/log.ts). The actor's role is stored too, since roles change.
 */
export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    actorRole: text("actor_role"),
    /** Dotted action name, e.g. "order.status", "stock.adjust". */
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    before: text("before"),
    after: text("after"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("audit_logs_created_at_idx").on(table.createdAt),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_actor_idx").on(table.actorUserId),
  ],
);
