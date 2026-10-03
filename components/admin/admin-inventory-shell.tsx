"use client";

import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFormNote } from "@/components/admin/admin-shell-note";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import type { AdminInventoryRow } from "@/lib/admin";

type DraftRow = {
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
};

type AdminInventoryShellProps = {
  rows: AdminInventoryRow[];
};

export function AdminInventoryShell({ rows }: AdminInventoryShellProps) {
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>(() =>
    Object.fromEntries(
      rows.map((row) => [
        row.sku,
        {
          stockQuantity: row.stockQuantity,
          reservedQuantity: row.reservedQuantity,
          lowStockThreshold: row.lowStockThreshold,
        },
      ]),
    ),
  );
  const [message, setMessage] = useState<string | null>(null);

  function updateDraft(sku: string, patch: Partial<DraftRow>) {
    setDrafts((current) => ({
      ...current,
      [sku]: { ...current[sku], ...patch },
    }));
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Inventory"
        description="Mock stock fields. Edits stay in this browser session only."
      />

      <AdminFormNote noun="inventory change" />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Product</AdminTh>
          <AdminTh>SKU</AdminTh>
          <AdminTh>Stock</AdminTh>
          <AdminTh>Reserved</AdminTh>
          <AdminTh>Available</AdminTh>
          <AdminTh>Low threshold</AdminTh>
          <AdminTh>
            <span className="sr-only">Actions</span>
          </AdminTh>
        </AdminTableHead>
        <tbody className="divide-y">
          {rows.map((row) => {
            const draft = drafts[row.sku] ?? {
              stockQuantity: row.stockQuantity,
              reservedQuantity: row.reservedQuantity,
              lowStockThreshold: row.lowStockThreshold,
            };
            const available = Math.max(
              0,
              draft.stockQuantity - draft.reservedQuantity,
            );
            const low = available <= draft.lowStockThreshold;

            return (
              <tr key={row.sku}>
                <AdminTd>
                  <p className="font-medium">{row.productName}</p>
                </AdminTd>
                <AdminTd className="font-mono text-xs">{row.sku}</AdminTd>
                <AdminTd>
                  <input
                    type="number"
                    min={0}
                    value={draft.stockQuantity}
                    onChange={(event) =>
                      updateDraft(row.sku, {
                        stockQuantity: Number(event.target.value) || 0,
                      })
                    }
                    className={`${fieldClassName()} w-20`}
                    aria-label={`Stock for ${row.sku}`}
                  />
                </AdminTd>
                <AdminTd>
                  <input
                    type="number"
                    min={0}
                    value={draft.reservedQuantity}
                    onChange={(event) =>
                      updateDraft(row.sku, {
                        reservedQuantity: Number(event.target.value) || 0,
                      })
                    }
                    className={`${fieldClassName()} w-20`}
                    aria-label={`Reserved for ${row.sku}`}
                  />
                </AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-2">
                    <span>{available}</span>
                    {low ? (
                      <AdminStatusBadge tone="warning">Low</AdminStatusBadge>
                    ) : null}
                  </div>
                </AdminTd>
                <AdminTd>
                  <input
                    type="number"
                    min={0}
                    value={draft.lowStockThreshold}
                    onChange={(event) =>
                      updateDraft(row.sku, {
                        lowStockThreshold: Number(event.target.value) || 0,
                      })
                    }
                    className={`${fieldClassName()} w-20`}
                    aria-label={`Low stock threshold for ${row.sku}`}
                  />
                </AdminTd>
                <AdminTd>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setMessage(
                        `Demo only — stock for ${row.sku} was not saved.`,
                      )
                    }
                  >
                    Save
                  </Button>
                </AdminTd>
              </tr>
            );
          })}
        </tbody>
      </AdminTable>

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
