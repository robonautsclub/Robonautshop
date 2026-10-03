"use client";

import { useState } from "react";

import {
  AdminField,
  AdminShellForm,
  fieldClassName,
} from "@/components/admin/admin-shell-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/catalog";

type AdminCategoriesShellProps = {
  categories: Category[];
};

export function AdminCategoriesShell({ categories }: AdminCategoriesShellProps) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Categories"
        description="Mock categories. Form changes are not written to a database."
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
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Name</AdminTh>
          <AdminTh>Slug</AdminTh>
          <AdminTh>Sort</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody className="divide-y">
          {categories.map((category) => (
            <tr key={category.id}>
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
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      {showCreate || editing ? (
        <AdminShellForm
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
