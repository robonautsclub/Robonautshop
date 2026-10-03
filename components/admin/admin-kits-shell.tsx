"use client";

import { useState } from "react";

import {
  AdminBomEditor,
  type AdminBomLine,
} from "@/components/admin/admin-bom-editor";
import {
  AdminField,
  AdminFormDialog,
  fieldClassName,
} from "@/components/admin/admin-form-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminPagination,
  useAdminPagination,
} from "@/components/admin/admin-pagination";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTableToolbarSearch,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { formatBdt, getKitComponents, type Kit, type ProductStatus } from "@/lib/catalog";

function statusTone(status: ProductStatus) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "DRAFT") return "warning" as const;
  return "neutral" as const;
}

export function AdminKitsShell({ kits }: { kits: Kit[] }) {
  const [editing, setEditing] = useState<Kit | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [bom, setBom] = useState<AdminBomLine[]>([]);
  const dialogOpen = showCreate || editing !== null;
  const pagination = useAdminPagination(kits, 20);

  function openCreate() {
    setEditing(null);
    setBom([]);
    setShowCreate(true);
  }

  function openEdit(kit: Kit) {
    const components = getKitComponents(kit.id);
    setBom(
      components.map((component) => ({
        productId: component.productId,
        quantity: component.quantity,
      })),
    );
    setShowCreate(false);
    setEditing(kit);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Kits"
        description={`${kits.length} kits · BOM lines must come from Products (add the product first, then search it here).`}
        actions={
          <Button type="button" size="sm" onClick={openCreate}>
            New kit
          </Button>
        }
        toolbar={
          <>
            <AdminTableToolbarSearch placeholder="Search kits (demo)" />
            <p className="text-xs text-muted-foreground">
              No creating parts inside Kits
            </p>
          </>
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
        <tbody>
          {pagination.pageItems.map((kit) => (
            <tr key={kit.id} className="hover:bg-muted/30">
              <AdminTd>
                <div>
                  <p className="font-medium">{kit.name}</p>
                  <p className="text-xs text-muted-foreground">{kit.slug}</p>
                </div>
              </AdminTd>
              <AdminTd className="font-medium">{formatBdt(kit.price)}</AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={statusTone(kit.status)}>
                  {kit.status}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={kit.featured ? "success" : "neutral"}>
                  {kit.featured ? "Featured" : "Standard"}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd className="text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(kit)}
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

      <AdminFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreate(false);
            setEditing(null);
            setBom([]);
          }
        }}
        title={editing ? `Edit kit · ${editing.name}` : "Create kit"}
        noun="kit"
        description="Pick products that already exist. If search is empty, add the product under Products first."
        className="sm:max-w-2xl"
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
        </div>

        <AdminBomEditor
          lines={bom}
          onChange={setBom}
          title="Kit BOM (from stock products)"
          emptyLabel="Kit box is empty. Search a product from stock and add it."
          searchInputId="kit-product-search"
        />
      </AdminFormDialog>
    </div>
  );
}
