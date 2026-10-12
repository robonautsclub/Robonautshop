"use server";

import { getProductCardModels, getProductsBySlugs, type ProductCardModel } from "@/lib/catalog/queries";
import { isProductSlug } from "@/lib/catalog/recently-viewed";
import { COMPARE_MAX } from "@/lib/compare/rows";
import { getRequestDb } from "@/lib/db/request";

/**
 * Current data (price, stock, specifications) for the slugs a visitor chose
 * to compare. The browser only supplies slugs — never trusted for anything else.
 */
export async function getCompareProductsAction(slugs: string[]): Promise<ProductCardModel[]> {
  const valid = Array.isArray(slugs)
    ? [...new Set(slugs.filter(isProductSlug))].slice(0, COMPARE_MAX)
    : [];
  if (valid.length === 0) {
    return [];
  }
  const db = await getRequestDb();
  return getProductCardModels(db, await getProductsBySlugs(db, valid));
}
