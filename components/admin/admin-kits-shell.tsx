"use client";

import { type FormEvent, useState } from "react";

import {
  AdminBomEditor,
  type AdminBomLine,
} from "@/components/admin/admin-bom-editor";
import { AdminDeleteTrigger } from "@/components/admin/admin-confirm-delete-dialog";
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
  AdminTd,
  AdminTh,
  catalogStatusTone,
} from "@/components/admin/admin-table";
import { useAdminSave } from "@/components/admin/use-admin-save";
import { Button } from "@/components/ui/button";
import type { AdminProductOption } from "@/lib/admin";
import { saveKitAction, setKitStatusAction } from "@/lib/admin/catalog-actions";
import { kitInputSchema } from "@/lib/admin/catalog-schemas";
import { formatBdt, type Kit, type KitComponent, type ProductStatus } from "@/lib/catalog";
import { PRODUCT_STATUS_VALUES } from "@/lib/db/schema/shared";

type AdminKitsShellProps = {
  kits: Kit[];
  /** All kit components across every kit — filtered per kit when a BOM dialog opens. */
  kitComponents: KitComponent[];
  productOptions: AdminProductOption[];
  projects: Array<{ id: string; name: string }>;
};

/** Kits backed by real D1 writes (tasks/phase-19-admin-catalog/124). */
export function AdminKitsShell({
  kits: rows,
  kitComponents,
  productOptions,
  projects,
}: AdminKitsShellProps) {
  const [editing, setEditing] = useState<Kit | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [bom, setBom] = useState<AdminBomLine[]>([]);
  const save = useAdminSave();
  const dialogOpen = showCreate || editing !== null;
  const pagination = useAdminPagination(rows, 20);

  function openCreate() {
    save.setError(null);
    setEditing(null);
    setBom([]);
    setShowCreate(true);
  }

  function openEdit(kit: Kit) {
    save.setError(null);
    setBom(
      kitComponents
        .filter((component) => component.kitId === kit.id)
        .map((component) => ({ productId: component.productId, quantity: component.quantity })),
    );
    setShowCreate(false);
    setEditing(kit);
  }

  function closeDialog() {
    setShowCreate(false);
    setEditing(null);
    setBom([]);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = {
      name: form.get("name"),
      slug: form.get("slug"),
      shortDescription: form.get("shortDescription"),
      description: form.get("description"),
      price: form.get("price"),
      compareAtPrice: form.get("compareAtPrice"),
      status: form.get("status"),
      featured: form.get("featured") === "on",
      projectId: form.get("projectId"),
      imageUrl: form.get("imageUrl"),
      imageAlt: form.get("imageAlt"),
      components: bom,
    };
    const parsed = kitInputSchema.safeParse(input);
    if (!parsed.success) {
      save.setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    const kitId = editing?.id ?? null;
    const result = await save.run(
      () => saveKitAction(kitId, input),
      kitId ? `Saved “${parsed.data.name}”.` : `Created “${parsed.data.name}”.`,
    );
    if (result?.ok) closeDialog();
  }

  function changeStatus(kit: Kit, status: ProductStatus, message: string) {
    void save.run(() => setKitStatusAction(kit.id, status), message);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Kits"
        description={`${rows.length} kits · Saved to the database. Components must be existing products.`}
        actions={
          <Button type="button" size="sm" onClick={openCreate}>
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
                <AdminStatusBadge tone={catalogStatusTone(kit.status)}>{kit.status}</AdminStatusBadge>
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={kit.featured ? "success" : "neutral"}>
                  {kit.featured ? "Featured" : "Standard"}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(kit)}>
                    Edit
                  </Button>
                  {kit.status === "ARCHIVED" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => changeStatus(kit, "DRAFT", `“${kit.name}” restored as a draft.`)}
                    >
                      Restore
                    </Button>
                  ) : (
                    <AdminDeleteTrigger
                      itemLabel={`the kit “${kit.name}”`}
                      title="Archive kit?"
                      description={`“${kit.name}” will be hidden from the store. You can restore it later.`}
                      buttonLabel="Archive"
                      buttonVariant="destructive"
                      onConfirm={() => changeStatus(kit, "ARCHIVED", `“${kit.name}” archived.`)}
                    />
                  )}
                </div>
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

      {save.status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {save.status}
        </p>
      ) : null}
      {save.error && !dialogOpen ? (
        <p className="text-sm text-destructive" role="alert">
          {save.error}
        </p>
      ) : null}

      <AdminFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        title={editing ? `Edit kit · ${editing.name}` : "Create kit"}
        noun="kit"
        description="Pick products that already exist. If search is empty, add the product under Products first."
        submitLabel={save.pending ? "Saving…" : "Save kit"}
        onSubmit={onSubmit}
        className="sm:max-w-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField id="admin-kit-name" label="Name">
            <input id="admin-kit-name" name="name" defaultValue={editing?.name ?? ""} className={fieldClassName()} />
          </AdminField>
          <AdminField id="admin-kit-slug" label="Slug (blank = from name)">
            <input id="admin-kit-slug" name="slug" defaultValue={editing?.slug ?? ""} className={fieldClassName()} />
          </AdminField>
          <AdminField id="admin-kit-price" label="Price (BDT)">
            <input id="admin-kit-price" name="price" type="number" min={1} defaultValue={editing?.price ?? ""} className={fieldClassName()} />
          </AdminField>
          <AdminField id="admin-kit-compare" label="Compare-at price (optional)">
            <input
              id="admin-kit-compare"
              name="compareAtPrice"
              type="number"
              min={0}
              defaultValue={editing?.compareAtPrice ?? ""}
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-kit-status" label="Status">
            <select id="admin-kit-status" name="status" defaultValue={editing?.status ?? "DRAFT"} className={fieldClassName()}>
              {PRODUCT_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField id="admin-kit-project" label="Builds project (optional)">
            <select id="admin-kit-project" name="projectId" defaultValue={editing?.projectId ?? ""} className={fieldClassName()}>
              <option value="">None</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField id="admin-kit-image" label="Image URL">
            <input
              id="admin-kit-image"
              name="imageUrl"
              placeholder="https://…"
              defaultValue={editing?.imageUrl ?? ""}
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-kit-image-alt" label="Image alt text">
            <input id="admin-kit-image-alt" name="imageAlt" defaultValue={editing?.imageAlt ?? ""} className={fieldClassName()} />
          </AdminField>
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input type="checkbox" name="featured" defaultChecked={editing?.featured ?? false} />
            Featured on the homepage
          </label>
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
          <div className="sm:col-span-2">
            <AdminField id="admin-kit-description" label="Description">
              <textarea
                id="admin-kit-description"
                name="description"
                rows={4}
                defaultValue={editing?.description ?? ""}
                className={`${fieldClassName()} min-h-24 py-2`}
              />
            </AdminField>
          </div>
        </div>

        <AdminBomEditor
          lines={bom}
          onChange={setBom}
          products={productOptions}
          title="Kit BOM (from stock products)"
          emptyLabel="Kit box is empty. Search a product from stock and add it."
          searchInputId="kit-product-search"
        />

        {save.error ? (
          <p className="text-sm text-destructive" role="alert">
            {save.error}
          </p>
        ) : null}
      </AdminFormDialog>
    </div>
  );
}
