"use client";

import { useState } from "react";

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
  AdminTableToolbarSearch,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/catalog";

type AdminCategoriesShellProps = {
  categories: Category[];
};

export function AdminCategoriesShell({
  categories: initialCategories,
}: AdminCategoriesShellProps) {
  const [rows, setRows] = useState(initialCategories);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const dialogOpen = showCreate || editing !== null;
  const pagination = useAdminPagination(rows, 20);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description={`${rows.length} categories · Add/Edit opens in a popup. Delete always asks for confirmation.`}
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditing(null);
              setShowCreate(true);
            }}
          >
            New category
          </Button>
        }
        toolbar={
          <>
            <AdminTableToolbarSearch placeholder="Search categories" />
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
                      setShowCreate(false);
                      setEditing(category);
                    }}
                  >
                    Edit
                  </Button>
                  <AdminDeleteTrigger
                    itemLabel={`the category “${category.name}”`}
                    title="Delete category?"
                    description={`Are you sure you want to delete “${category.name}”? This removes it from the list.`}
                    buttonLabel="Delete"
                    buttonVariant="destructive"
                    onConfirm={() => {
                      setRows((current) =>
                        current.filter((row) => row.id !== category.id),
                      );
                      setStatus(
                        `“${category.name}” was removed.`,
                      );
                    }}
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

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}

      <AdminFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreate(false);
            setEditing(null);
          }
        }}
        title={
          editing ? `Edit category · ${editing.name}` : "Create category"
        }
        noun="category"
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
          <AdminField id="admin-category-slug" label="Slug">
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
      </AdminFormDialog>
    </div>
  );
}
