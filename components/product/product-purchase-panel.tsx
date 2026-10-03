"use client";

import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { PriceDisplay } from "@/components/product/price-display";
import { StockBadge } from "@/components/product/stock-badge";
import { Button } from "@/components/ui/button";
import { getAvailableQuantity } from "@/lib/catalog/types";
import type {
  InventorySummary,
  Product,
  ProductVariant,
} from "@/lib/catalog/types";

type ProductPurchasePanelProps = {
  product: Product;
  variants: ProductVariant[];
  inventory: InventorySummary[];
};

export function ProductPurchasePanel({
  product,
  variants,
  inventory,
}: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.id ?? null,
  );
  const [message, setMessage] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants],
  );

  const activeInventory = useMemo(() => {
    if (selectedVariant) {
      return (
        inventory.find((row) => row.variantId === selectedVariant.id) ?? null
      );
    }

    return inventory.find((row) => row.variantId === null) ?? inventory[0] ?? null;
  }, [inventory, selectedVariant]);

  const price = selectedVariant?.price ?? product.price;
  const sku = selectedVariant?.sku ?? product.sku;
  const available = activeInventory
    ? getAvailableQuantity(activeInventory)
    : 0;
  const lowStockThreshold = activeInventory?.lowStockThreshold ?? 5;
  const canAdd = available > 0;

  function handleAddToCart() {
    const added = addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      quantity: 1,
    });

    setMessage(
      added
        ? "Added to cart."
        : "Could not add this item. It may be out of stock.",
    );
  }

  return (
    <div className="space-y-5">
      <PriceDisplay
        price={price}
        compareAtPrice={selectedVariant ? null : product.compareAtPrice}
        size="lg"
      />

      <div className="flex flex-wrap items-center gap-3">
        <StockBadge
          availableQuantity={available}
          lowStockThreshold={lowStockThreshold}
        />
        <p className="text-sm text-muted-foreground">
          SKU <span className="font-medium text-foreground">{sku}</span>
        </p>
      </div>

      {variants.length > 0 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Variant</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const selected = variant.id === selectedVariantId;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setMessage(null);
                  }}
                  aria-pressed={selected}
                  className={
                    selected
                      ? "rounded-lg border border-foreground bg-foreground px-3 py-1.5 text-sm font-medium text-background"
                      : "rounded-lg border bg-background px-3 py-1.5 text-sm font-medium hover:border-foreground/30"
                  }
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="space-y-2">
        <Button type="button" size="lg" disabled={!canAdd} onClick={handleAddToCart}>
          {canAdd ? "Add to cart" : "Out of stock"}
        </Button>
        {message ? (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
