"use client";

import { useEffect, useState } from "react";

import { ProductCard, ProductGrid } from "@/components/product";
import type { ProductCardModel } from "@/lib/catalog/queries";
import {
  addRecentSlug,
  parseRecentSlugs,
  RECENTLY_VIEWED_KEY,
} from "@/lib/catalog/recently-viewed";
import { getRecentlyViewedCardsAction } from "@/lib/catalog/recently-viewed-actions";

type RecentlyViewedProps = {
  /** On a product page: record this product and leave it out of the row. */
  currentSlug?: string;
};

/** Small client island: slugs live in localStorage, data comes from the server. */
export function RecentlyViewed({ currentSlug }: RecentlyViewedProps) {
  const [cards, setCards] = useState<ProductCardModel[]>([]);

  useEffect(() => {
    let cancelled = false;
    let stored: string[] = [];
    try {
      stored = parseRecentSlugs(window.localStorage.getItem(RECENTLY_VIEWED_KEY));
      if (currentSlug) {
        window.localStorage.setItem(
          RECENTLY_VIEWED_KEY,
          JSON.stringify(addRecentSlug(stored, currentSlug)),
        );
      }
    } catch (error) {
      // Storage can be blocked (private mode, disabled cookies) — just skip the row.
      console.error("[recently-viewed] storage unavailable:", error);
      return;
    }

    const toShow = stored.filter((slug) => slug !== currentSlug);
    if (toShow.length === 0) return;

    void getRecentlyViewedCardsAction(toShow).then((result) => {
      if (!cancelled) setCards(result);
    });
    return () => {
      cancelled = true;
    };
  }, [currentSlug]);

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="mt-12" aria-labelledby="recently-viewed-heading">
      <h2 id="recently-viewed-heading" className="text-xl font-semibold tracking-tight">
        Recently viewed
      </h2>
      <div className="mt-4">
        <ProductGrid>
          {cards.map((card) => (
            <ProductCard
              key={card.product.id}
              product={card.product}
              imageUrl={card.imageUrl}
              imageAlt={card.imageAlt}
              availableQuantity={card.availableQuantity}
            />
          ))}
        </ProductGrid>
      </div>
    </section>
  );
}
