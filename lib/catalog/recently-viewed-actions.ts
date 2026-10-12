"use server";

import { getProductCardModels, getProductsBySlugs, type ProductCardModel } from "@/lib/catalog/queries";
import { isProductSlug, RECENTLY_VIEWED_MAX } from "@/lib/catalog/recently-viewed";
import { getRequestDb } from "@/lib/db/request";

/**
 * Current card data for slugs remembered in the browser. The browser only
 * supplies slugs; names, prices and stock always come from the database.
 */
export async function getRecentlyViewedCardsAction(slugs: string[]): Promise<ProductCardModel[]> {
  const valid = Array.isArray(slugs)
    ? [...new Set(slugs.filter(isProductSlug))].slice(0, RECENTLY_VIEWED_MAX)
    : [];
  if (valid.length === 0) {
    return [];
  }
  const db = await getRequestDb();
  return getProductCardModels(db, await getProductsBySlugs(db, valid));
}
