import Image from "next/image";
import Link from "next/link";

import { PriceDisplay } from "@/components/product/price-display";
import { StockBadge } from "@/components/product/stock-badge";
import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export type ProductCardProps = {
  product: Product;
  imageUrl?: string | null;
  imageAlt?: string;
  availableQuantity: number;
  className?: string;
};

export function ProductCard({
  product,
  imageUrl,
  imageAlt,
  availableQuantity,
  className,
}: ProductCardProps) {
  return (
    <li className={cn("list-none", className)}>
      <Link
        href={`/products/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border bg-background transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-sm font-medium leading-snug tracking-tight group-hover:underline">
              {product.name}
            </h2>
            <StockBadge availableQuantity={availableQuantity} />
          </div>
          {product.brand ? (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          ) : null}
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>
          <div className="mt-auto pt-2">
            <PriceDisplay
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="sm"
            />
          </div>
        </div>
      </Link>
    </li>
  );
}
