"use client";

import { type FormEvent, useState } from "react";

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
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { useAdminSave } from "@/components/admin/use-admin-save";
import { Button } from "@/components/ui/button";
import { deleteCategoryAction, saveCategoryAction } from "@/lib/admin/catalog-actions";
import { categoryInputSchema } from "@/lib/admin/catalog-schemas";
import type { Category } from "@/lib/catalog";

type AdminCategoriesShellProps = {
  categories: Category[];
};

/** Categories backed by real D1 writes (tasks/phase-19-admin-catalog/121). */
export function AdminCategoriesShell({
  categories: rows,
}: AdminCategoriesShellProps) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const save = useAdminSave();
  const dialogOpen = showCreate || editing !== null;
  const pagination = useAdminPagination(rows, 20);

  function closeDialog() {
    setShowCreate(false);
    setEditing(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = {
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      sortOrder: form.get("sortOrder"),
    };
    const parsed = categoryInputSchema.safeParse(input);
    if (!parsed.success) {
      save.setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    const categoryId = editing?.id ?? null;
    const result = await save.run(
      () => saveCategoryAction(categoryId, input),
      categoryId ? `Saved “${parsed.data.name}”.` : `Created “${parsed.data.name}”.`,
    );
    if (result?.ok) closeDialog();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description={`${rows.length} categories · Saved to the database. A category can only be deleted once no product uses it.`}
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => {
              save.setError(null);
              setEditing(null);
              setShowCreate(true);
            }}
          >
            New category
          </Button>
        }
        toolbar={
          <>
            <p className="text-xs text-muted-foreground">
              Sorted by catalog sort order
            </p>
          </>
        }
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Name</AdminTh>
          <AdminTh>Slug</AdminTh>
          <AdminTh>Sort</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody>
          {pagination.pageItems.map((category) => (
            <tr key={category.id} className="hover:bg-muted/30">
              <AdminTd>
                <div>
                  <p className="font-medium">{category.name}</p>
                  {category.description ? (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  ) : null}
                </div>
              </AdminTd>
              <AdminTd className="font-mono text-xs">{category.slug}</AdminTd>
              <AdminTd>{category.sortOrder}</AdminTd>
              <AdminTd className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      save.setError(null);
                      setShowCreate(false);
                      setEditing(category);
                    }}
                  >
                    Edit
                  </Button>
                  <AdminDeleteTrigger
                    itemLabel={`the category “${category.name}”`}
                    title="Delete category?"
                    description={`Are you sure you want to delete “${category.name}”? This can't be undone.`}
                    buttonLabel="Delete"
                    buttonVariant="destructive"
                    onConfirm={() =>
                      void save.run(
                        () => deleteCategoryAction(category.id),
                        `“${category.name}” was deleted.`,
                      )
                    }
                  />
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
        title={
          editing ? `Edit category · ${editing.name}` : "Create category"
        }
        noun="category"
        submitLabel={save.pending ? "Saving…" : "Save category"}
        onSubmit={onSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField id="admin-category-name" label="Name">
            <input
              id="admin-category-name"
              name="name"
              defaultValue={editing?.name ?? ""}
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-category-slug" label="Slug (blank = from name)">
            <input
              id="admin-category-slug"
              name="slug"
              defaultValue={editing?.slug ?? ""}
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-category-sort" label="Sort order">
            <input
              id="admin-category-sort"
              name="sortOrder"
              type="number"
              defaultValue={editing?.sortOrder ?? 0}
              className={fieldClassName()}
            />
          </AdminField>
          <div className="sm:col-span-2">
            <AdminField id="admin-category-desc" label="Description">
              <textarea
                id="admin-category-desc"
                name="description"
                rows={3}
                defaultValue={editing?.description ?? ""}
                className={`${fieldClassName()} min-h-20 py-2`}
              />
            </AdminField>
          </div>
        </div>
        {save.error ? (
          <p className="text-sm text-destructive" role="alert">
            {save.error}
          </p>
        ) : null}
      </AdminFormDialog>
    </div>
  );
}
