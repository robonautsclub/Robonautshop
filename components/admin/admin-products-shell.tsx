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
  AdminTableToolbarSearch,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { formatBdt, type Product, type ProductStatus } from "@/lib/catalog";

type AdminProductsShellProps = {
  products: Array<Product & { categoryName: string }>;
  categories: Array<{ id: string; name: string }>;
};

function statusTone(status: ProductStatus) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "DRAFT") return "warning" as const;
  return "neutral" as const;
}

export function AdminProductsShell({
  products,
  categories,
}: AdminProductsShellProps) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description={`${products.length} catalog products · create/edit is a non-persistent form shell.`}
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditing(null);
              setShowCreate(true);
            }}
          >
            New product
          </Button>
        }
        toolbar={
          <>
            <AdminTableToolbarSearch placeholder="Search products (demo)" />
            <p className="text-xs text-muted-foreground">
              Filters come in a later phase
            </p>
          </>
        }
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Name</AdminTh>
          <AdminTh>SKU</AdminTh>
          <AdminTh>Category</AdminTh>
          <AdminTh>Price</AdminTh>
          <AdminTh>Status</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-muted/30">
              <AdminTd>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.slug}</p>
                </div>
              </AdminTd>
              <AdminTd className="font-mono text-xs">{product.sku}</AdminTd>
              <AdminTd>{product.categoryName}</AdminTd>
              <AdminTd className="font-medium">
                {formatBdt(product.price)}
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={statusTone(product.status)}>
                  {product.status}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd className="text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreate(false);
                    setEditing(product);
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
          title={editing ? `Edit product · ${editing.name}` : "Create product"}
          noun="product"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField id="admin-product-name" label="Name">
              <input
                id="admin-product-name"
                name="name"
                defaultValue={editing?.name ?? ""}
                className={fieldClassName()}
              />
            </AdminField>
            <AdminField id="admin-product-sku" label="SKU">
              <input
                id="admin-product-sku"
                name="sku"
                defaultValue={editing?.sku ?? ""}
                className={fieldClassName()}
              />
            </AdminField>
            <AdminField id="admin-product-slug" label="Slug">
              <input
                id="admin-product-slug"
                name="slug"
                defaultValue={editing?.slug ?? ""}
                className={fieldClassName()}
              />
            </AdminField>
            <AdminField id="admin-product-price" label="Price (BDT)">
              <input
                id="admin-product-price"
                name="price"
                type="number"
                inputMode="numeric"
                defaultValue={editing?.price ?? ""}
                className={fieldClassName()}
              />
            </AdminField>
            <AdminField id="admin-product-category" label="Category">
              <select
                id="admin-product-category"
                name="categoryId"
                defaultValue={editing?.categoryId ?? categories[0]?.id ?? ""}
                className={fieldClassName()}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField id="admin-product-status" label="Status">
              <select
                id="admin-product-status"
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
              <AdminField id="admin-product-short" label="Short description">
                <textarea
                  id="admin-product-short"
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
