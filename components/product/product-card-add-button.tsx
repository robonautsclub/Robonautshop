"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductCardAddButtonProps = {
  productId: string;
  productName: string;
  availableQuantity: number;
  className?: string;
};

/**
 * Compact Add-to-cart control for product cards: opens a small quantity
 * popover over the button, then merges into the cart.
 */
export function ProductCardAddButton({
  productId,
  productName,
  availableQuantity,
  className,
}: ProductCardAddButtonProps) {
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();
  const canAdd = availableQuantity > 0;
  const maxQty = Math.max(1, availableQuantity);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function openPopover() {
    if (!canAdd) {
      return;
    }
    setQuantity(1);
    setStatus(null);
    setOpen(true);
  }

  function confirmAdd() {
    const added = addItem({
      productId,
      variantId: null,
      quantity,
    });
    setStatus(added ? "Added" : "Unavailable");
    if (added) {
      window.setTimeout(() => setOpen(false), 500);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        type="button"
        size="sm"
        className="shrink-0"
        disabled={!canAdd}
        aria-label={canAdd ? `Add ${productName} to cart` : `${productName} out of stock`}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (open) {
            setOpen(false);
          } else {
            openPopover();
          }
        }}
      >
        <ShoppingCart />
        {canAdd ? "Add" : "Sold out"}
      </Button>

      {open ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label={`Choose quantity for ${productName}`}
          className="absolute right-0 bottom-full z-20 mb-2 w-44 origin-bottom-right rounded-xl border bg-popover p-2.5 text-popover-foreground shadow-lg transition-all duration-150"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            Quantity
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <Minus />
            </Button>
            <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
              {quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              aria-label="Increase quantity"
              disabled={quantity >= maxQty}
              onClick={() =>
                setQuantity((value) => Math.min(maxQty, value + 1))
              }
            >
              <Plus />
            </Button>
            <Button
              type="button"
              size="xs"
              className="ml-auto"
              onClick={confirmAdd}
            >
              Add
            </Button>
          </div>
          {status ? (
            <p className="mt-1.5 text-[11px] text-muted-foreground" role="status">
              {status}
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Max {maxQty}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
