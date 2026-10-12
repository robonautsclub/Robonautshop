"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { clearCompare, toggleCompare, useCompareSlugs } from "@/components/compare/compare-store";
import { CatalogEmptyState, PriceDisplay, StockBadge } from "@/components/product";
import { Button } from "@/components/ui/button";
import type { ProductCardModel } from "@/lib/catalog/queries";
import { getCompareProductsAction } from "@/lib/compare/actions";
import { buildCompareRows } from "@/lib/compare/rows";
import { cn } from "@/lib/utils";

/** Side-by-side comparison of the products picked on this device (task 139). */
export function CompareView() {
  const slugs = useCompareSlugs();
  const key = slugs.join(",");
  const [loaded, setLoaded] = useState<{ key: string; cards: ProductCardModel[] } | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    void getCompareProductsAction(key.split(",")).then((cards) => {
      if (!cancelled) setLoaded({ key, cards });
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (slugs.length === 0) {
    return (
      <CatalogEmptyState
        title="Nothing to compare yet"
        description="Use the compare button on product cards or product pages to add up to 4 products."
        actionHref="/products"
        actionLabel="Browse products"
      />
    );
  }

  if (!loaded || loaded.key !== key) {
    return <p className="text-sm text-muted-foreground">Loading comparison…</p>;
  }

  // Keep the order the visitor added them in; skip products that are no longer published.
  const cards = slugs.flatMap((slug) => {
    const card = loaded.cards.find((entry) => entry.product.slug === slug);
    return card ? [card] : [];
  });
  const rows = buildCompareRows(cards.map((card) => card.product.specifications));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={clearCompare}>
          Clear all
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <caption className="sr-only">Product comparison</caption>
          <thead>
            <tr className="border-b align-top">
              <th scope="col" className="w-32 bg-muted/40 p-3 text-left font-medium">
                Product
              </th>
              {cards.map((card) => (
                <th key={card.product.id} scope="col" className="min-w-44 p-3 text-left font-normal">
                  <Link href={`/products/${card.product.slug}`} className="block space-y-2">
                    <span className="relative block aspect-square w-24 overflow-hidden rounded-lg border bg-muted">
                      {card.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={card.imageAlt}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="block font-medium hover:underline">{card.product.name}</span>
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="mt-1"
                    onClick={() => toggleCompare(card.product.slug)}
                  >
                    Remove
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <th scope="row" className="bg-muted/40 p-3 text-left font-medium">
                Price
              </th>
              {cards.map((card) => (
                <td key={card.product.id} className="p-3">
                  <PriceDisplay
                    price={card.product.price}
                    compareAtPrice={card.product.compareAtPrice}
                    size="sm"
                  />
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="bg-muted/40 p-3 text-left font-medium">
                Availability
              </th>
              {cards.map((card) => (
                <td key={card.product.id} className="p-3">
                  <StockBadge availableQuantity={card.availableQuantity} />
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="bg-muted/40 p-3 text-left font-medium">
                Brand
              </th>
              {cards.map((card) => (
                <td key={card.product.id} className="p-3">
                  {card.product.brand ?? "—"}
                </td>
              ))}
            </tr>
            {rows.map((row) => (
              <tr key={row.label} className={cn(row.differs && "bg-amber-500/5")}>
                <th scope="row" className="bg-muted/40 p-3 text-left font-medium">
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td key={cards[index].product.id} className="p-3">
                    {value ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          These products don’t list any specifications yet.
        </p>
      ) : null}
    </div>
  );
}
