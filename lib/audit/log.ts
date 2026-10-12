import { and, desc, eq, like } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema/audit-logs";
import { users } from "@/lib/db/schema/users";

const SENSITIVE_KEY = /pass(word)?|secret|token|api[-_]?key|authorization|cookie|otp|pin/i;
const MAX_VALUE_LENGTH = 300;

/** Copies a snapshot with secret-looking keys redacted and long text trimmed. */
export function sanitizeAuditData(data: Record<string, unknown> | null | undefined): string | null {
  if (!data) return null;
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEY.test(key)) {
      clean[key] = "[redacted]";
    } else if (typeof value === "string" && value.length > MAX_VALUE_LENGTH) {
      clean[key] = `${value.slice(0, MAX_VALUE_LENGTH)}…`;
    } else {
      clean[key] = value;
    }
  }
  return JSON.stringify(clean);
}

export type AuditEntry = {
  actor: { id: string; role?: string | null };
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
};

/**
 * Appends one audit row. Best-effort: a logging failure is reported to the
 * console but never fails the admin action that already succeeded.
 */
export async function recordAudit(db: Database, entry: AuditEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorUserId: entry.actor.id,
      actorRole: entry.actor.role ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      before: sanitizeAuditData(entry.before),
      after: sanitizeAuditData(entry.after),
    });
  } catch (error) {
    console.error("[audit] could not write audit log entry:", entry.action, error);
  }
}

export type AuditLogRow = {
  id: string;
  actorName: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: string | null;
  after: string | null;
  createdAt: string;
};

export type AuditFilters = { entityType?: string; action?: string; limit?: number };

export async function listAuditLogs(db: Database, filters: AuditFilters = {}): Promise<AuditLogRow[]> {
  const conditions = [];
  if (filters.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));
  if (filters.action) conditions.push(like(auditLogs.action, `${filters.action}%`));

  return db
    .select({
      id: auditLogs.id,
      actorName: users.name,
      actorEmail: users.email,
      actorRole: auditLogs.actorRole,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      before: auditLogs.before,
      after: auditLogs.after,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(users, eq(users.id, auditLogs.actorUserId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
    .limit(Math.min(filters.limit ?? 100, 500));
}
