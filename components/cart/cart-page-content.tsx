"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState } from "@/components/product";
import { PriceDisplay } from "@/components/product/price-display";
import { StockBadge } from "@/components/product/stock-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatBdt } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function CartPageContent() {
  const {
    hydrated,
    resolvedLines,
    subtotal,
    removeItem,
    setQuantity,
    clearCart,
  } = useCart();

  if (!hydrated) {
    return (
      <PageContainer as="section" className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
        <p className="mt-2 text-sm text-muted-foreground">Loading cart…</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
          <p className="mt-2 text-muted-foreground">
            Prices are resolved from the catalog, not from stored client values.
          </p>
        </div>
        {resolvedLines.length > 0 ? (
          <Button type="button" variant="outline" onClick={clearCart}>
            Clear cart
          </Button>
        ) : null}
      </div>

      {resolvedLines.length === 0 ? (
        <CatalogEmptyState
          title="Your cart is empty"
          description="Browse products or kits and add the parts you need."
          actionHref="/products"
          actionLabel="Browse products"
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)]">
          <ul className="divide-y rounded-xl border">
            {resolvedLines.map((line) => (
              <li
                key={line.key}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/products/${line.product.slug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-lg border bg-muted"
                >
                  {line.imageUrl ? (
                    <Image
                      src={line.imageUrl}
                      alt={line.imageAlt}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : null}
                </Link>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${line.product.slug}`}
                        className="font-medium tracking-tight hover:underline"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        SKU {line.sku} · {formatBdt(line.unitPrice)} each
                      </p>
                    </div>
                    <PriceDisplay price={line.lineTotal} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <StockBadge
                      availableQuantity={line.availableQuantity}
                      lowStockThreshold={line.lowStockThreshold}
                    />

                    <div className="inline-flex items-center rounded-lg border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Decrease quantity for ${line.name}`}
                        disabled={line.quantity <= 1}
                        onClick={() =>
                          setQuantity(
                            line.productId,
                            line.variantId,
                            line.quantity - 1,
                          )
                        }
                      >
                        <Minus />
                      </Button>
                      <span className="min-w-8 text-center text-sm font-medium">
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Increase quantity for ${line.name}`}
                        disabled={line.quantity >= line.availableQuantity}
                        onClick={() =>
                          setQuantity(
                            line.productId,
                            line.variantId,
                            line.quantity + 1,
                          )
                        }
                      >
                        <Plus />
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeItem(line.productId, line.variantId)
                      }
                    >
                      <Trash2 />
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border p-5">
            <h2 className="text-lg font-semibold tracking-tight">Summary</h2>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatBdt(subtotal)}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Delivery charge and payment are selected on the checkout page.
            </p>
            <Link
              href="/checkout"
              className={cn(buttonVariants(), "mt-4 w-full")}
            >
              Checkout
            </Link>
            <Link
              href="/products"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-2 w-full",
              )}
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </PageContainer>
  );
}
