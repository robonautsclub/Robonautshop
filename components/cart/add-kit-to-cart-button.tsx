"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import type { RequirementLine } from "@/lib/catalog";

type AddKitToCartButtonProps = {
  lines: RequirementLine[];
  kitName: string;
};

export function AddKitToCartButton({
  lines,
  kitName,
}: AddKitToCartButtonProps) {
  const { addItems } = useCart();
  const [message, setMessage] = useState<string | null>(null);

  const requiredLines = lines.filter((line) => !line.optional);
  const canAdd = requiredLines.some((line) => line.availableQuantity > 0);

  function handleAdd() {
    const addedCount = addItems(
      requiredLines.map((line) => ({
        productId: line.product.id,
        variantId: line.variant?.id ?? null,
        quantity: line.quantity,
      })),
    );

    setMessage(
      addedCount > 0
        ? `Added ${addedCount} stock component${addedCount === 1 ? "" : "s"} from ${kitName} to cart (existing products, not new SKUs).`
        : "No in-stock kit components could be added.",
    );
  }

  return (
    <div className="space-y-2">
      <Button type="button" disabled={!canAdd} onClick={handleAdd}>
        Add kit components to cart
      </Button>
      <p className="text-xs text-muted-foreground">
        Expands into stock products from this kit&apos;s BOM — nothing new is
        created.
      </p>
      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
