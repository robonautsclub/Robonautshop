"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";

import { AdminDialog } from "@/components/admin/admin-dialog";
import { AdminField, fieldClassName } from "@/components/admin/admin-form-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminPagination,
  useAdminPagination,
} from "@/components/admin/admin-pagination";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { useAdminSave } from "@/components/admin/use-admin-save";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AdminInventoryRow } from "@/lib/admin";
import {
  adjustStockAction,
  listStockMovementsAction,
  setLowStockThresholdAction,
} from "@/lib/admin/catalog-actions";
import { stockAdjustmentInputSchema } from "@/lib/admin/catalog-schemas";
import { formatAdminDateTime } from "@/lib/admin/format-date";
import { ADMIN_STOCK_REASONS } from "@/lib/db/schema/shared";
import type { StockMovementRow } from "@/lib/inventory/adjustments";
import { cn } from "@/lib/utils";

const REASON_LABELS: Record<StockMovementRow["reason"], string> = {
  RECEIVED: "Received from supplier",
  DAMAGED: "Damaged / defective",
  RECOUNT: "Stock count correction",
  RETURNED: "Customer return",
  CORRECTION: "Other correction",
  ORDER_SHIPPED: "Order shipped",
};

type AdminInventoryShellProps = {
  rows: AdminInventoryRow[];
};

/**
 * Real inventory (tasks/phase-19-admin-catalog/122). Stock only changes
 * through a reasoned adjustment, which the server refuses if it would drop
 * below the units reserved for open orders. Every change is in the history.
 */
export function AdminInventoryShell({ rows }: AdminInventoryShellProps) {
  const [adjusting, setAdjusting] = useState<AdminInventoryRow | null>(null);
  const [historyFor, setHistoryFor] = useState<AdminInventoryRow | null>(null);
  const [history, setHistory] = useState<StockMovementRow[] | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const save = useAdminSave();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? rows.filter((row) => row.productName.toLowerCase().includes(q) || row.sku.toLowerCase().includes(q))
      : rows;
  }, [query, rows]);
  const lowCount = rows.filter((row) => row.availableQuantity <= row.lowStockThreshold).length;
  const pagination = useAdminPagination(filtered, 20);

  function openAdjust(row: AdminInventoryRow) {
    save.setError(null);
    setAdjusting(row);
  }

  async function openHistory(row: AdminInventoryRow) {
    setHistoryFor(row);
    setHistory(null);
    setHistoryError(null);
    try {
      setHistory(await listStockMovementsAction(row.id));
    } catch (error) {
      console.error("Could not load stock history", error);
      setHistoryError("Couldn't load the history. Please try again.");
    }
  }

  async function onAdjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adjusting) return;
    const form = new FormData(event.currentTarget);
    const input = {
      inventoryId: adjusting.id,
      delta: form.get("delta"),
      reason: form.get("reason"),
      note: form.get("note"),
    };
    const parsed = stockAdjustmentInputSchema.safeParse(input);
    if (!parsed.success) {
      save.setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    const sku = adjusting.sku;
    const result = await save.run(() => adjustStockAction(input));
    if (result?.ok) {
      save.setStatus(`${sku}: stock is now ${result.stockAfter}.`);
      setAdjusting(null);
    }
  }

  async function onThreshold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adjusting) return;
    const form = new FormData(event.currentTarget);
    const value = Number(form.get("lowStockThreshold"));
    const sku = adjusting.sku;
    const result = await save.run(
      () => setLowStockThresholdAction(adjusting.id, value),
      `${sku}: low-stock alert at ${value}.`,
    );
    if (result?.ok) setAdjusting(null);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Inventory"
        description={`${rows.length} SKUs · ${lowCount} low · available = stock − reserved for open orders.`}
        toolbar={
          <>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search product or SKU"
              aria-label="Search inventory"
              className="h-8 w-full max-w-xs rounded-lg border bg-background px-3 text-sm"
            />
            <AdminStatusBadge tone={lowCount > 0 ? "warning" : "success"}>
              {lowCount} low
            </AdminStatusBadge>
          </>
        }
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Product</AdminTh>
          <AdminTh>SKU</AdminTh>
          <AdminTh>Stock</AdminTh>
          <AdminTh>Reserved</AdminTh>
          <AdminTh>Available</AdminTh>
          <AdminTh>Low alert at</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody>
          {pagination.pageItems.map((row) => {
            const low = row.availableQuantity <= row.lowStockThreshold;
            return (
              <tr key={row.id} className={low ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-muted/30"}>
                <AdminTd>
                  <p className="font-medium">{row.productName}</p>
                </AdminTd>
                <AdminTd className="font-mono text-xs">{row.sku}</AdminTd>
                <AdminTd>{row.stockQuantity}</AdminTd>
                <AdminTd>
                  <AdminStatusBadge tone={row.reservedQuantity > 0 ? "warning" : "neutral"}>
                    {row.reservedQuantity} reserved
                  </AdminStatusBadge>
                </AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{row.availableQuantity}</span>
                    {row.availableQuantity === 0 ? (
                      <AdminStatusBadge tone="danger">Out of stock</AdminStatusBadge>
                    ) : low ? (
                      <AdminStatusBadge tone="warning">Low</AdminStatusBadge>
                    ) : null}
                  </div>
                </AdminTd>
                <AdminTd>{row.lowStockThreshold}</AdminTd>
                <AdminTd className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => openAdjust(row)}>
                      Adjust
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => void openHistory(row)}>
                      History
                    </Button>
                  </div>
                </AdminTd>
              </tr>
            );
          })}
        </tbody>
      </AdminTable>

      <AdminPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      {save.status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {save.status}
        </p>
      ) : null}

      <AdminDialog
        open={adjusting !== null}
        onOpenChange={(open) => {
          if (!open) setAdjusting(null);
        }}
        title={adjusting ? `Adjust stock · ${adjusting.sku}` : "Adjust stock"}
        description={
          adjusting
            ? `${adjusting.productName} · ${adjusting.stockQuantity} in stock, ${adjusting.reservedQuantity} reserved.`
            : undefined
        }
      >
        {adjusting ? (
          <div className="space-y-6">
            <form key={`adjust-${adjusting.id}`} onSubmit={onAdjust} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField id="inv-delta" label="Change (+ add, − remove)">
                  <input id="inv-delta" name="delta" type="number" step={1} placeholder="e.g. 20 or -2" className={fieldClassName()} />
                </AdminField>
                <AdminField id="inv-reason" label="Reason">
                  <select id="inv-reason" name="reason" defaultValue="RECEIVED" className={fieldClassName()}>
                    {ADMIN_STOCK_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {REASON_LABELS[reason]}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <div className="sm:col-span-2">
                  <AdminField id="inv-note" label="Note (optional)">
                    <input id="inv-note" name="note" maxLength={300} className={fieldClassName()} />
                  </AdminField>
                </div>
              </div>
              <Button type="submit" disabled={save.pending}>
                {save.pending ? "Saving…" : "Save adjustment"}
              </Button>
            </form>

            <form key={`threshold-${adjusting.id}`} onSubmit={onThreshold} className="flex flex-wrap items-end gap-2 border-t pt-4">
              <AdminField id="inv-low" label="Low-stock alert at">
                <input
                  id="inv-low"
                  name="lowStockThreshold"
                  type="number"
                  min={0}
                  defaultValue={adjusting.lowStockThreshold}
                  className={cn(fieldClassName(), "w-32")}
                />
              </AdminField>
              <Button type="submit" variant="outline" disabled={save.pending}>
                Save threshold
              </Button>
            </form>

            {save.error ? (
              <p className="text-sm text-destructive" role="alert">
                {save.error}
              </p>
            ) : null}
          </div>
        ) : null}
      </AdminDialog>

      <AdminDialog
        open={historyFor !== null}
        onOpenChange={(open) => {
          if (!open) setHistoryFor(null);
        }}
        title={historyFor ? `Stock history · ${historyFor.sku}` : "Stock history"}
        description="Latest 50 changes to the stock quantity."
        className="sm:max-w-2xl"
      >
        {historyError ? (
          <p className="text-sm text-destructive" role="alert">
            {historyError}
          </p>
        ) : history === null ? (
          <p className="text-sm text-muted-foreground" role="status">
            Loading…
          </p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stock changes recorded yet.</p>
        ) : (
          <ul className="divide-y rounded-lg border text-sm">
            {history.map((movement) => (
              <li key={movement.id} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2">
                <div>
                  <p className="font-medium">
                    <span className={movement.delta > 0 ? "text-emerald-600" : "text-destructive"}>
                      {movement.delta > 0 ? `+${movement.delta}` : movement.delta}
                    </span>{" "}
                    · {REASON_LABELS[movement.reason]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatAdminDateTime(movement.createdAt)}
                    {movement.actorName ? ` · ${movement.actorName}` : ""}
                    {movement.orderId ? ` · order ${movement.orderId}` : ""}
                    {movement.note ? ` · ${movement.note}` : ""}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Stock after: {movement.stockAfter}</span>
              </li>
            ))}
          </ul>
        )}
      </AdminDialog>

      <p className="text-xs text-muted-foreground">
        Need a new SKU?{" "}
        <Link href="/admin/products" className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}>
          Add it under Products
        </Link>{" "}
        first.
      </p>
    </div>
  );
}
