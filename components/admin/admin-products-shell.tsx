"use client";

import { type FormEvent, useMemo, useState } from "react";

import { AdminDeleteTrigger } from "@/components/admin/admin-confirm-delete-dialog";
import { AdminDialog } from "@/components/admin/admin-dialog";
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
import { AdminProductImages } from "@/components/admin/admin-product-images";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTd,
  catalogStatusTone,
  AdminTh,
} from "@/components/admin/admin-table";
import {
  AdminVariantsEditor,
  type AdminVariantDraft,
} from "@/components/admin/admin-variants-editor";
import { useAdminSave } from "@/components/admin/use-admin-save";
import { Button } from "@/components/ui/button";
import {
  saveProductAction,
  setProductStatusAction,
} from "@/lib/admin/catalog-actions";
import {
  formatSpecificationLines,
  parseSpecificationLines,
  productInputSchema,
} from "@/lib/admin/catalog-schemas";
import {
  formatBdt,
  type Product,
  type ProductImage,
  type ProductStatus,
  type ProductVariant,
} from "@/lib/catalog";
import { PRODUCT_STATUS_VALUES } from "@/lib/db/schema/shared";

type ProductRow = Product & { categoryName: string };

type AdminProductsShellProps = {
  products: ProductRow[];
  categories: Array<{ id: string; name: string }>;
  variants: ProductVariant[];
  images: ProductImage[];
};

function variantDrafts(variants: ProductVariant[]): AdminVariantDraft[] {
  return variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    sku: variant.sku,
    price: variant.price === null ? "" : String(variant.price),
  }));
}

/**
 * Products admin backed by real D1 writes (tasks/phase-19-admin-catalog/119,
 * 120, 123). Products are archived rather than deleted so order history,
 * kits and project BOMs keep their references.
 */
export function AdminProductsShell({
  products,
  categories,
  variants,
  images,
}: AdminProductsShellProps) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [imagesFor, setImagesFor] = useState<Product | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [variantRows, setVariantRows] = useState<AdminVariantDraft[]>([]);
  const save = useAdminSave();
  const dialogOpen = showCreate || editing !== null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        (statusFilter === "ALL" || product.status === statusFilter) &&
        (!q || product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q)),
    );
  }, [products, query, statusFilter]);
  const pagination = useAdminPagination(filtered, 20);

  function openCreate() {
    save.setError(null);
    setEditing(null);
    setVariantRows([]);
    setShowCreate(true);
  }

  function openEdit(product: Product) {
    save.setError(null);
    setShowCreate(false);
    setVariantRows(variantDrafts(variants.filter((variant) => variant.productId === product.id)));
    setEditing(product);
  }

  function closeDialog() {
    setShowCreate(false);
    setEditing(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = productInputSchema.safeParse({
      name: form.get("name"),
      slug: form.get("slug"),
      sku: form.get("sku"),
      brand: form.get("brand"),
      categoryId: form.get("categoryId"),
      price: form.get("price"),
      compareAtPrice: form.get("compareAtPrice"),
      weightGrams: form.get("weightGrams"),
      status: form.get("status"),
      featured: form.get("featured") === "on",
      shortDescription: form.get("shortDescription"),
      description: form.get("description"),
      specifications: parseSpecificationLines(String(form.get("specifications") ?? "")),
      variants: variantRows,
    });
    if (!parsed.success) {
      save.setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    const productId = editing?.id ?? null;
    const result = await save.run(
      () => saveProductAction(productId, parsed.data),
      productId ? `Saved “${parsed.data.name}”.` : `Created “${parsed.data.name}”.`,
    );
    if (result?.ok) closeDialog();
  }

  function changeStatus(product: Product, status: ProductStatus, message: string) {
    void save.run(() => setProductStatusAction(product.id, status), message);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description={`${products.length} products · Saved to the database. Archive hides a product from the store without breaking past orders.`}
        actions={
          <Button type="button" size="sm" onClick={openCreate}>
            New product
          </Button>
        }
        toolbar={
          <>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name or SKU"
              aria-label="Search products"
              className="h-8 w-full max-w-xs rounded-lg border bg-background px-3 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ProductStatus | "ALL")}
                className="h-8 rounded-lg border bg-background px-2 text-sm"
              >
                <option value="ALL">All</option>
                {PRODUCT_STATUS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
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
              <AdminTd className="font-medium">{formatBdt(product.price)}</AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={catalogStatusTone(product.status)}>{product.status}</AdminStatusBadge>
              </AdminTd>
              <AdminTd className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(product)}>
                    Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setImagesFor(product)}>
                    Images
                  </Button>
                  {product.status === "ARCHIVED" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => changeStatus(product, "DRAFT", `“${product.name}” restored as a draft.`)}
                    >
                      Restore
                    </Button>
                  ) : (
                    <AdminDeleteTrigger
                      itemLabel={`the product “${product.name}”`}
                      title="Archive product?"
                      description={`“${product.name}” will be hidden from the store. Past orders, kits and projects keep their reference. You can restore it later.`}
                      buttonLabel="Archive"
                      buttonVariant="destructive"
                      onConfirm={() => changeStatus(product, "ARCHIVED", `“${product.name}” archived.`)}
                    />
                  )}
                </div>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
          No products match. Try another search or status.
        </p>
      ) : null}

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
        title={editing ? `Edit product · ${editing.name}` : "Create product"}
        noun="product"
        description="Saved to the database. Published products appear in the store right away."
        submitLabel={save.pending ? "Saving…" : editing ? "Save product" : "Create product"}
        onSubmit={onSubmit}
        className="sm:max-w-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField id="admin-product-name" label="Name">
            <input id="admin-product-name" name="name" defaultValue={editing?.name ?? ""} className={fieldClassName()} />
          </AdminField>
          <AdminField id="admin-product-sku" label="SKU">
            <input id="admin-product-sku" name="sku" defaultValue={editing?.sku ?? ""} className={fieldClassName()} />
          </AdminField>
          <AdminField id="admin-product-slug" label="Slug (blank = from name)">
            <input id="admin-product-slug" name="slug" defaultValue={editing?.slug ?? ""} className={fieldClassName()} />
          </AdminField>
          <AdminField id="admin-product-brand" label="Brand (optional)">
            <input id="admin-product-brand" name="brand" defaultValue={editing?.brand ?? ""} className={fieldClassName()} />
          </AdminField>
          <AdminField id="admin-product-price" label="Price (BDT)">
            <input
              id="admin-product-price"
              name="price"
              type="number"
              min={1}
              inputMode="numeric"
              defaultValue={editing?.price ?? ""}
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-product-compare" label="Compare-at price (optional)">
            <input
              id="admin-product-compare"
              name="compareAtPrice"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={editing?.compareAtPrice ?? ""}
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
              {PRODUCT_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField id="admin-product-weight" label="Weight in grams (optional)">
            <input
              id="admin-product-weight"
              name="weightGrams"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={editing?.weightGrams ?? ""}
              className={fieldClassName()}
            />
          </AdminField>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
            <input type="checkbox" name="featured" defaultChecked={editing?.featured ?? false} />
            Featured on the homepage
          </label>
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
          <div className="sm:col-span-2">
            <AdminField id="admin-product-description" label="Description">
              <textarea
                id="admin-product-description"
                name="description"
                rows={4}
                defaultValue={editing?.description ?? ""}
                className={`${fieldClassName()} min-h-24 py-2`}
              />
            </AdminField>
          </div>
          <div className="sm:col-span-2">
            <AdminField id="admin-product-specs" label="Specifications (one “Key: Value” per line)">
              <textarea
                id="admin-product-specs"
                name="specifications"
                rows={4}
                placeholder={"Operating Voltage: 5V\nInterface: Digital"}
                defaultValue={editing ? formatSpecificationLines(editing.specifications) : ""}
                className={`${fieldClassName()} min-h-24 py-2 font-mono text-xs`}
              />
            </AdminField>
          </div>
        </div>

        <AdminVariantsEditor variants={variantRows} onChange={setVariantRows} />

        {save.error ? (
          <p className="text-sm text-destructive" role="alert">
            {save.error}
          </p>
        ) : null}
      </AdminFormDialog>

      <AdminDialog
        open={imagesFor !== null}
        onOpenChange={(open) => {
          if (!open) setImagesFor(null);
        }}
        title={imagesFor ? `Images · ${imagesFor.name}` : "Images"}
        description="Uploaded to R2. The first image is the main product image."
        className="sm:max-w-2xl"
      >
        {imagesFor ? (
          <AdminProductImages
            productId={imagesFor.id}
            productName={imagesFor.name}
            images={images.filter((image) => image.productId === imagesFor.id)}
          />
        ) : null}
      </AdminDialog>
    </div>
  );
}
