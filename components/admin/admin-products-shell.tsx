"use client";

import { useState } from "react";

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
  const dialogOpen = showCreate || editing !== null;
  const pagination = useAdminPagination(products, 20);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description={`${products.length} catalog products · Add/Edit opens in a popup. Add products here before attaching them to kits.`}
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
              Products must exist before Kits can use them
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
          {pagination.pageItems.map((product) => (
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
          }
        }}
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
      </AdminFormDialog>
    </div>
  );
}
