import type { ProductWithRelations } from "@/lib/catalog";
import { getAvailableQuantity } from "@/lib/catalog/types";
import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * schema.org JSON-LD builders (tasks/phase-18-hardening/112). Every value
 * comes from the database — never invent ratings, reviews, or stock.
 */

export type JsonLdObject = Record<string, unknown>;

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: ProductWithRelations): JsonLdObject {
  const prices = [product.price, ...product.variants.flatMap((v) => (v.price === null ? [] : [v.price]))];
  const inStock = product.inventory.some((row) => getAvailableQuantity(row) > 0);
  const url = absoluteUrl(`/products/${product.slug}`);
  const availability = inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.shortDescription || product.description,
    url,
    ...(product.images.length > 0
      ? { image: product.images.map((image) => absoluteUrl(image.url)) }
      : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.category ? { category: product.category.name } : {}),
    offers:
      lowPrice === highPrice
        ? {
            "@type": "Offer",
            url,
            price: lowPrice,
            priceCurrency: "BDT",
            availability,
          }
        : {
            "@type": "AggregateOffer",
            url,
            lowPrice,
            highPrice,
            offerCount: prices.length,
            priceCurrency: "BDT",
            availability,
          },
  };
}

/**
 * Serialise for an inline <script type="application/ld+json">. Escapes `<`
 * so product text can never close the script tag (no XSS via catalog data).
 */
export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
