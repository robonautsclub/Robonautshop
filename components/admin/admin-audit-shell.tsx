import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { fieldClassName } from "@/components/auth/auth-form-shell";
import type { AuditLogRow } from "@/lib/audit/log";

const ENTITY_TYPES = ["order", "inventory", "product", "category", "kit", "project", "coupon", "user"];

/** Formats a stored JSON snapshot as `key: value` pairs. */
function describeSnapshot(raw: string | null): string {
  if (!raw) return "—";
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(", ");
  } catch {
    // Rows are written by recordAudit as JSON; show anything else verbatim.
    return raw;
  }
}

type AdminAuditShellProps = {
  entries: AuditLogRow[];
  filters: { entity: string; action: string };
};

/** Read-only: audit rows are append-only, so there is no edit or delete control. */
export function AdminAuditShell({ entries, filters }: AdminAuditShellProps) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit log"
        description={`Latest ${entries.length} recorded admin actions. Entries can't be edited or deleted.`}
      />

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-xl border p-4">
        <div className="space-y-1.5">
          <label htmlFor="audit-entity" className="text-xs font-medium">
            Entity
          </label>
          <select id="audit-entity" name="entity" defaultValue={filters.entity} className={fieldClassName()}>
            <option value="">All</option>
            {ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="audit-action" className="text-xs font-medium">
            Action starts with
          </label>
          <input
            id="audit-action"
            name="action"
            defaultValue={filters.action}
            placeholder="e.g. order."
            className={fieldClassName()}
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
        >
          Filter
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No audit entries match.</p>
      ) : (
        <AdminTable>
          <AdminTableHead>
            <AdminTh>When</AdminTh>
            <AdminTh>Actor</AdminTh>
            <AdminTh>Action</AdminTh>
            <AdminTh>Target</AdminTh>
            <AdminTh>Before</AdminTh>
            <AdminTh>After</AdminTh>
          </AdminTableHead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="align-top hover:bg-muted/30">
                <AdminTd className="whitespace-nowrap text-xs">{entry.createdAt}</AdminTd>
                <AdminTd>
                  <p className="font-medium">{entry.actorName ?? "Deleted user"}</p>
                  <p className="text-xs text-muted-foreground">{entry.actorRole ?? ""}</p>
                </AdminTd>
                <AdminTd className="font-mono text-xs">{entry.action}</AdminTd>
                <AdminTd className="text-xs">
                  {entry.entityType}
                  {entry.entityId ? ` · ${entry.entityId.slice(0, 8)}` : ""}
                </AdminTd>
                <AdminTd className="text-xs">{describeSnapshot(entry.before)}</AdminTd>
                <AdminTd className="text-xs">{describeSnapshot(entry.after)}</AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
