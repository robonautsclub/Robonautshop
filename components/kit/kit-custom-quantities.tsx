"use client";

import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatBdt, type RequirementLine } from "@/lib/catalog";

type KitCustomQuantitiesProps = {
  lines: RequirementLine[];
  kitName: string;
};

export function KitCustomQuantities({
  lines,
  kitName,
}: KitCustomQuantitiesProps) {
  const { addItems } = useCart();
  const required = useMemo(
    () => lines.filter((line) => !line.optional),
    [lines],
  );
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      required.map((line) => [line.product.id, line.quantity]),
    ),
  );
  const [message, setMessage] = useState<string | null>(null);

  const total = required.reduce((sum, line) => {
    const qty = quantities[line.product.id] ?? line.quantity;
    return sum + line.unitPrice * qty;
  }, 0);

  function handleAdd() {
    const payload = required.map((line) => ({
      productId: line.product.id,
      variantId: line.variant?.id ?? null,
      quantity: Math.max(1, quantities[line.product.id] ?? line.quantity),
    }));
    const addedCount = addItems(payload);
    setMessage(
      addedCount > 0
        ? `Added ${addedCount} stock component${addedCount === 1 ? "" : "s"} from ${kitName} to cart (not new products).`
        : "No in-stock kit components could be added.",
    );
  }

  if (required.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Customize quantities
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust jumper/motor/wheel counts and similar. Every line is an
          existing stock product — nothing new is created.
        </p>
      </div>

      <ul className="space-y-3">
        {required.map((line) => {
          const qty = quantities[line.product.id] ?? line.quantity;
          const max = Math.max(line.quantity, line.availableQuantity);
          return (
            <li
              key={line.product.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="font-medium">{line.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBdt(line.unitPrice)} · available{" "}
                  {line.availableQuantity}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                Qty
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, max)}
                  value={qty}
                  onChange={(event) =>
                    setQuantities((current) => ({
                      ...current,
                      [line.product.id]: Math.max(
                        1,
                        Number(event.target.value) || 1,
                      ),
                    }))
                  }
                  className="h-9 w-20 rounded-lg border bg-background px-3 text-sm"
                />
              </label>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">
          Estimated total: {formatBdt(total)}
        </p>
        <Button type="button" onClick={handleAdd}>
          Add customized kit to cart
        </Button>
      </div>

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
