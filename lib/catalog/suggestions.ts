import { getProductCardModels, getProductsPage } from "@/lib/catalog/queries";
import type { Database } from "@/lib/db";

export const SUGGESTION_LIMIT = 6;
export const SUGGESTION_MIN_QUERY_LENGTH = 2;

export type ProductSuggestion = {
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
};

/** Top matches for the navbar search dropdown (task 136) — few fields only. */
export async function getProductSuggestions(
  db: Database,
  query: string,
): Promise<ProductSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < SUGGESTION_MIN_QUERY_LENGTH) {
    return [];
  }

  const { products } = await getProductsPage(db, {
    query: trimmed,
    pageSize: SUGGESTION_LIMIT,
  });
  const cards = await getProductCardModels(db, products);

  return cards.map((card) => ({
    name: card.product.name,
    slug: card.product.slug,
    price: card.product.price,
    imageUrl: card.imageUrl,
  }));
}
