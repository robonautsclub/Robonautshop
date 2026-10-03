"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

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
import { Button, buttonVariants } from "@/components/ui/button";
import { listAdminProducts } from "@/lib/admin";
import {
  formatBdt,
  getImagesForProduct,
  getKitComponents,
  type Kit,
  type Product,
  type ProductStatus,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

function statusTone(status: ProductStatus) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "DRAFT") return "warning" as const;
  return "neutral" as const;
}

type BomLine = {
  productId: string;
  quantity: number;
};

function productThumb(product: Product) {
  const image = getImagesForProduct(product.id)[0];
  return image ?? null;
}

export function AdminKitsShell({ kits }: { kits: Kit[] }) {
  const allProducts = useMemo(() => listAdminProducts(), []);
  const [editing, setEditing] = useState<Kit | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [bom, setBom] = useState<BomLine[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const dialogOpen = showCreate || editing !== null;
  const pagination = useAdminPagination(kits, 20);

  const productById = useMemo(
    () => new Map(allProducts.map((product) => [product.id, product])),
    [allProducts],
  );

  const searchHits = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return [];
    return allProducts
      .filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.sku.toLowerCase().includes(q),
      )
      .filter((product) => !bom.some((line) => line.productId === product.id))
      .slice(0, 8);
  }, [allProducts, bom, productQuery]);

  function openCreate() {
    setEditing(null);
    setBom([]);
    setProductQuery("");
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
    setProductQuery("");
    setShowCreate(false);
    setEditing(kit);
  }

  function addProduct(productId: string) {
    setBom((current) => [...current, { productId, quantity: 1 }]);
    setProductQuery("");
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
            setProductQuery("");
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

        <div className="space-y-3 border-t pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold tracking-tight">
              Kit BOM (from stock products)
            </h3>
            <Link
              href="/admin/products"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
              )}
            >
              Add product first
            </Link>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="kit-product-search" className="text-sm font-medium">
              Search products to add
            </label>
            <input
              id="kit-product-search"
              value={productQuery}
              onChange={(event) => setProductQuery(event.target.value)}
              placeholder="Name or SKU…"
              className={fieldClassName()}
            />
            {productQuery.trim() && searchHits.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No product found.{" "}
                <Link
                  href="/admin/products"
                  className="font-medium underline-offset-4 hover:underline"
                >
                  Add it under Products
                </Link>{" "}
                first, then search again.
              </p>
            ) : null}
            {searchHits.length > 0 ? (
              <ul className="overflow-hidden rounded-lg border">
                {searchHits.map((product) => {
                  const image = productThumb(product);
                  return (
                    <li
                      key={product.id}
                      className="flex items-center gap-3 border-b px-3 py-2 last:border-b-0"
                    >
                      <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {product.name}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addProduct(product.id)}
                      >
                        Add
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {bom.length === 0 ? (
            <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
              Kit box is empty. Search a product from stock and add it.
            </p>
          ) : (
            <ul className="space-y-2">
              {bom.map((line) => {
                const product = productById.get(line.productId);
                if (!product) return null;
                const image = productThumb(product);
                return (
                  <li
                    key={line.productId}
                    className="flex flex-wrap items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={image.alt}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {product.sku} · {formatBdt(product.price)}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      Qty
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(event) =>
                          setBom((current) =>
                            current.map((item) =>
                              item.productId === line.productId
                                ? {
                                    ...item,
                                    quantity: Math.max(
                                      1,
                                      Number(event.target.value) || 1,
                                    ),
                                  }
                                : item,
                            ),
                          )
                        }
                        className={`${fieldClassName()} w-20`}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setBom((current) =>
                          current.filter(
                            (item) => item.productId !== line.productId,
                          ),
                        )
                      }
                    >
                      Remove
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </AdminFormDialog>
    </div>
  );
}
