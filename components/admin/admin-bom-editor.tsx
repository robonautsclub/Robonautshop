"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminDeleteTrigger } from "@/components/admin/admin-confirm-delete-dialog";
import { fieldClassName } from "@/components/admin/admin-form-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { listAdminProducts } from "@/lib/admin";
import { formatBdt, getImagesForProduct, type Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export type AdminBomLine = {
  productId: string;
  quantity: number;
};

type AdminBomEditorProps = {
  lines: AdminBomLine[];
  onChange: (lines: AdminBomLine[]) => void;
  title?: string;
  emptyLabel?: string;
  searchInputId?: string;
};

function productThumb(product: Product) {
  return getImagesForProduct(product.id)[0] ?? null;
}

export function AdminBomEditor({
  lines,
  onChange,
  title = "Components (from stock products)",
  emptyLabel = "Box is empty. Search a product from stock and add it.",
  searchInputId = "admin-bom-product-search",
}: AdminBomEditorProps) {
  const allProducts = useMemo(() => listAdminProducts(), []);
  const [productQuery, setProductQuery] = useState("");

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
      .filter((product) => !lines.some((line) => line.productId === product.id))
      .slice(0, 8);
  }, [allProducts, lines, productQuery]);

  function addProduct(productId: string) {
    onChange([...lines, { productId, quantity: 1 }]);
    setProductQuery("");
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Add product first
        </Link>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={searchInputId} className="text-sm font-medium">
          Search products to add
        </label>
        <input
          id={searchInputId}
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
                    <p className="truncate text-sm font-medium">{product.name}</p>
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

      {lines.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ul className="space-y-2">
          {lines.map((line) => {
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
                      onChange(
                        lines.map((item) =>
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
                <AdminDeleteTrigger
                  itemLabel={`“${product.name}” from this list`}
                  title="Remove component?"
                  description={`Are you sure you want to remove “${product.name}” from this BOM? You can add it again later by searching stock products.`}
                  buttonLabel="Remove"
                  confirmLabel="Remove"
                  buttonVariant="ghost"
                  onConfirm={() =>
                    onChange(
                      lines.filter((item) => item.productId !== line.productId),
                    )
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
