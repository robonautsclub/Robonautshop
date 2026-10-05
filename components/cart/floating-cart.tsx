"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { PriceDisplay } from "@/components/product/price-display";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatBdt } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function shouldHideFloatingCart(pathname: string): boolean {
  return pathname === "/cart" || pathname.startsWith("/checkout");
}

/**
 * Circular FAB (bottom-right) that opens an animated cart sheet.
 * Hidden on /cart and /checkout. Sheet mounts after client hydrate to avoid
 * Base UI useId SSR mismatches (same pattern as MobileNavSheet).
 */
export function FloatingCart() {
  const pathname = usePathname();
  const {
    hydrated,
    resolvedLines,
    itemCount,
    subtotal,
    removeItem,
    setQuantity,
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (shouldHideFloatingCart(pathname)) {
    return null;
  }

  const cartLabel =
    hydrated && itemCount > 0 ? `Cart, ${itemCount} items` : "Cart";

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-label={cartLabel}
        className="fixed right-5 bottom-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg opacity-90"
      >
        <ShoppingCart className="size-6" aria-hidden />
      </button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label={cartLabel}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed right-5 bottom-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200",
          "hover:scale-105 hover:shadow-xl active:scale-95",
          "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        )}
      >
        <ShoppingCart className="size-6" aria-hidden />
        {hydrated && itemCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1 text-[11px] font-semibold text-foreground shadow-sm ring-2 ring-primary">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </button>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            {hydrated
              ? itemCount === 0
                ? "No items yet."
                : `${itemCount} item${itemCount === 1 ? "" : "s"}`
              : "Loading…"}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {!hydrated ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading cart…
            </p>
          ) : resolvedLines.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <ShoppingCart
                className="size-10 text-muted-foreground/60"
                aria-hidden
              />
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Browse products and add the parts you need.
              </p>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "outline" }), "mt-1")}
              >
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {resolvedLines.map((line) => (
                <li key={line.key} className="flex gap-3 py-3">
                  <Link
                    href={`/products/${line.product.slug}`}
                    onClick={() => setOpen(false)}
                    className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted"
                  >
                    {line.imageUrl ? (
                      <Image
                        src={line.imageUrl}
                        alt={line.imageAlt}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${line.product.slug}`}
                          onClick={() => setOpen(false)}
                          className="line-clamp-2 text-sm font-medium tracking-tight hover:underline"
                        >
                          {line.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatBdt(line.unitPrice)} each
                        </p>
                      </div>
                      <PriceDisplay price={line.lineTotal} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center rounded-lg border">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
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
                        <span className="min-w-7 text-center text-xs font-medium">
                          {line.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
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
                        size="xs"
                        aria-label={`Remove ${line.name}`}
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
          )}
        </div>

        <SheetFooter className="border-t bg-background">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">
              {hydrated ? formatBdt(subtotal) : "—"}
            </span>
          </div>
          <Link
            href="/checkout"
            onClick={() => setOpen(false)}
            aria-disabled={!hydrated || resolvedLines.length === 0}
            className={cn(
              buttonVariants(),
              "w-full",
              (!hydrated || resolvedLines.length === 0) &&
                "pointer-events-none opacity-50",
            )}
          >
            Checkout
          </Link>
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full",
            )}
          >
            View full cart
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
