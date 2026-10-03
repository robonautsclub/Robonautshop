"use client";

import { useState } from "react";

import {
  AdminField,
  AdminShellForm,
  fieldClassName,
} from "@/components/admin/admin-shell-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { formatBdt, type Kit, type ProductStatus } from "@/lib/catalog";

function statusTone(status: ProductStatus) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "DRAFT") return "warning" as const;
  return "neutral" as const;
}

export function AdminKitsShell({ kits }: { kits: Kit[] }) {
  const [editing, setEditing] = useState<Kit | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Kits"
        description="Mock kits. Create/edit form does not persist."
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditing(null);
              setShowCreate(true);
            }}
          >
            New kit
          </Button>
        }
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Name</AdminTh>
          <AdminTh>Price</AdminTh>
          <AdminTh>Status</AdminTh>
          <AdminTh>Featured</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody className="divide-y">
          {kits.map((kit) => (
            <tr key={kit.id}>
              <AdminTd>
                <div>
                  <p className="font-medium">{kit.name}</p>
                  <p className="text-xs text-muted-foreground">{kit.slug}</p>
                </div>
              </AdminTd>
              <AdminTd>{formatBdt(kit.price)}</AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={statusTone(kit.status)}>
                  {kit.status}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd>{kit.featured ? "Yes" : "No"}</AdminTd>
              <AdminTd className="text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreate(false);
                    setEditing(kit);
                  }}
                >
                  Edit
                </Button>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      {showCreate || editing ? (
        <AdminShellForm
          title={editing ? `Edit kit · ${editing.name}` : "Create kit"}
          noun="kit"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField id="admin-kit-name" label="Name">
              <input
                id="admin-kit-name"
                name="name"
                defaultValue={editing?.name ?? ""}
                className={fieldClassName()}
              />
            </AdminField>
            <AdminField id="admin-kit-slug" label="Slug">
              <input
                id="admin-kit-slug"
                name="slug"
                defaultValue={editing?.slug ?? ""}
                className={fieldClassName()}
              />
            </AdminField>
            <AdminField id="admin-kit-price" label="Price (BDT)">
              <input
                id="admin-kit-price"
                name="price"
                type="number"
                defaultValue={editing?.price ?? ""}
                className={fieldClassName()}
              />
            </AdminField>
            <AdminField id="admin-kit-status" label="Status">
              <select
                id="admin-kit-status"
                name="status"
                defaultValue={editing?.status ?? "DRAFT"}
                className={fieldClassName()}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </AdminField>
            <div className="sm:col-span-2">
              <AdminField id="admin-kit-short" label="Short description">
                <textarea
                  id="admin-kit-short"
                  name="shortDescription"
                  rows={2}
                  defaultValue={editing?.shortDescription ?? ""}
                  className={`${fieldClassName()} min-h-16 py-2`}
                />
              </AdminField>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(null);
              setShowCreate(false);
            }}
          >
            Cancel
          </Button>
        </AdminShellForm>
      ) : null}
    </div>
  );
}
