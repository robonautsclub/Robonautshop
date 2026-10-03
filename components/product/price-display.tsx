import { formatBdt } from "@/lib/catalog/money";
import { cn } from "@/lib/utils";

type PriceDisplayProps = {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
} as const;

export function PriceDisplay({
  price,
  compareAtPrice = null,
  className,
  size = "md",
}: PriceDisplayProps) {
  const showCompare =
    compareAtPrice !== null && compareAtPrice > price;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-semibold tracking-tight", sizeClass[size])}>
        {formatBdt(price)}
      </span>
      {showCompare ? (
        <span className="text-sm text-muted-foreground line-through">
          {formatBdt(compareAtPrice)}
        </span>
      ) : null}
    </div>
  );
}
