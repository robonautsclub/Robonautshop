import { AdminAuditShell } from "@/components/admin/admin-audit-shell";
import { listAuditLogs } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";

export const dynamic = "force-dynamic";

type AuditPageProps = {
  searchParams: Promise<{ entity?: string; action?: string }>;
};

export default async function AdminAuditPage({ searchParams }: AuditPageProps) {
  await requirePermission("audit.view");
  const params = await searchParams;
  const entityType = params.entity?.trim() || undefined;
  const action = params.action?.trim() || undefined;

  const db = await getRequestDb();
  const entries = await listAuditLogs(db, { entityType, action, limit: 200 });
  return <AdminAuditShell entries={entries} filters={{ entity: entityType ?? "", action: action ?? "" }} />;
}
