"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { AdminDialog } from "@/components/admin/admin-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminPagination,
  useAdminPagination,
} from "@/components/admin/admin-pagination";
import { AdminFormNote } from "@/components/admin/admin-shell-note";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTableToolbarSearch,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  getBookedQuantityForSku,
  subscribeBookingStore,
  type AdminInventoryRow,
} from "@/lib/admin";
import { cn } from "@/lib/utils";

type DraftRow = {
  stockQuantity: number;
  lowStockThreshold: number;
};

type AdminInventoryShellProps = {
  rows: AdminInventoryRow[];
};

export function AdminInventoryShell({ rows }: AdminInventoryShellProps) {
  const [, setTick] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>(() =>
    Object.fromEntries(
      rows.map((row) => [
        row.sku,
        {
          stockQuantity: row.stockQuantity,
          lowStockThreshold: row.lowStockThreshold,
        },
      ]),
    ),
  );
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => subscribeBookingStore(() => setTick((n) => n + 1)), []);

  const enriched = useMemo(
    () =>
      rows.map((row) => {
        const draft = drafts[row.sku] ?? {
          stockQuantity: row.stockQuantity,
          lowStockThreshold: row.lowStockThreshold,
        };
        const booked =
          getBookedQuantityForSku(row.sku) || row.reservedQuantity;
        const available = Math.max(0, draft.stockQuantity - booked);
        return {
          ...row,
          stockQuantity: draft.stockQuantity,
          lowStockThreshold: draft.lowStockThreshold,
          bookedQuantity: booked,
          availableQuantity: available,
          low: available <= draft.lowStockThreshold,
        };
      }),
    [drafts, rows],
  );

  const lowCount = enriched.filter((row) => row.low).length;
  const pagination = useAdminPagination(enriched, 20);
  const editing = enriched.find((row) => row.sku === editingSku) ?? null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Inventory"
        description={`${rows.length} SKUs · ${lowCount} low · available = stock − booked.`}
        toolbar={
          <>
            <AdminTableToolbarSearch placeholder="Search SKUs (demo)" />
            <AdminStatusBadge tone={lowCount > 0 ? "warning" : "success"}>
              {lowCount} low
            </AdminStatusBadge>
          </>
        }
      />

      <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Booking rules</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Open orders <strong>book</strong> units (COD included) so others
            cannot buy them.
          </li>
          <li>
            Storefront stock uses <strong>available</strong>, not raw stock.
          </li>
          <li>Cancelled orders release booked units back to available.</li>
        </ul>
      </div>

      <AdminFormNote noun="inventory change" />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Product</AdminTh>
          <AdminTh>SKU</AdminTh>
          <AdminTh>Stock</AdminTh>
          <AdminTh>Booked</AdminTh>
          <AdminTh>Available</AdminTh>
          <AdminTh>Low threshold</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody>
          {pagination.pageItems.map((row) => (
            <tr
              key={row.sku}
              className={
                row.low
                  ? "bg-amber-500/5 hover:bg-amber-500/10"
                  : "hover:bg-muted/30"
              }
            >
              <AdminTd>
                <p className="font-medium">{row.productName}</p>
              </AdminTd>
              <AdminTd className="font-mono text-xs">{row.sku}</AdminTd>
              <AdminTd>{row.stockQuantity}</AdminTd>
              <AdminTd>
                <AdminStatusBadge
                  tone={row.bookedQuantity > 0 ? "warning" : "neutral"}
                >
                  {row.bookedQuantity} booked
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{row.availableQuantity}</span>
                  {row.low ? (
                    <AdminStatusBadge tone="warning">Low</AdminStatusBadge>
                  ) : null}
                  {row.availableQuantity === 0 ? (
                    <AdminStatusBadge tone="danger">
                      Out for sale
                    </AdminStatusBadge>
                  ) : null}
                </div>
              </AdminTd>
              <AdminTd>{row.lowStockThreshold}</AdminTd>
              <AdminTd className="text-right">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingSku(row.sku)}
                >
                  Edit
                </Button>
              </AdminTd>
            </tr>
          ))}
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

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}

      <AdminDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditingSku(null);
        }}
        title={editing ? `Edit stock · ${editing.sku}` : "Edit stock"}
        description="Demo only — changes stay in this browser session."
      >
        {editing ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{editing.productName}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="inv-stock"
                  className="text-sm font-medium"
                >
                  Stock quantity
                </label>
                <input
                  id="inv-stock"
                  type="number"
                  min={0}
                  value={editing.stockQuantity}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [editing.sku]: {
                        ...current[editing.sku],
                        stockQuantity: Number(event.target.value) || 0,
                      },
                    }))
                  }
                  className={fieldClassName()}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="inv-low"
                  className="text-sm font-medium"
                >
                  Low threshold
                </label>
                <input
                  id="inv-low"
                  type="number"
                  min={0}
                  value={editing.lowStockThreshold}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [editing.sku]: {
                        ...current[editing.sku],
                        lowStockThreshold: Number(event.target.value) || 0,
                      },
                    }))
                  }
                  className={fieldClassName()}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Booked: {editing.bookedQuantity} · Available:{" "}
              {editing.availableQuantity}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => {
                  setMessage(
                    `Demo only — stock for ${editing.sku} was not saved to a database.`,
                  );
                  setEditingSku(null);
                }}
              >
                Save (demo)
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingSku(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </AdminDialog>

      <p className="text-xs text-muted-foreground">
        Need a new SKU?{" "}
        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}
        >
          Add it under Products
        </Link>{" "}
        first.
      </p>
    </div>
  );
}
