import { cn } from "@/lib/utils";

type StockBadgeProps = {
  availableQuantity: number;
  lowStockThreshold?: number;
  className?: string;
};

export function StockBadge({
  availableQuantity,
  lowStockThreshold = 5,
  className,
}: StockBadgeProps) {
  if (availableQuantity <= 0) {
    return (
      <span
        className={cn(
          "inline-flex rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive",
          className,
        )}
      >
        Out of stock
      </span>
    );
  }

  if (availableQuantity <= lowStockThreshold) {
    return (
      <span
        className={cn(
          "inline-flex rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200",
          className,
        )}
      >
        Low stock ({availableQuantity})
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200",
        className,
      )}
    >
      In stock
    </span>
  );
}
