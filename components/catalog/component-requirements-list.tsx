import Link from "next/link";

import { PriceDisplay } from "@/components/product/price-display";
import { StockBadge } from "@/components/product/stock-badge";
import type { RequirementLine } from "@/lib/catalog";
import { formatBdt } from "@/lib/catalog/money";
import { cn } from "@/lib/utils";

type ComponentRequirementsListProps = {
  lines: RequirementLine[];
  className?: string;
  showOptionalBadge?: boolean;
};

export function ComponentRequirementsList({
  lines,
  className,
  showOptionalBadge = true,
}: ComponentRequirementsListProps) {
  if (lines.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No components listed.
      </p>
    );
  }

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return (
    <div className={cn("overflow-hidden rounded-xl border", className)}>
      <ul className="divide-y">
        {lines.map((line) => {
          const label = line.variant
            ? `${line.product.name} · ${line.variant.name}`
            : line.product.name;

          return (
            <li
              key={line.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/products/${line.product.slug}`}
                    className="font-medium tracking-tight hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {label}
                  </Link>
                  {showOptionalBadge && line.optional ? (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Optional
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  Qty {line.quantity} · {formatBdt(line.unitPrice)} each
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <StockBadge
                  availableQuantity={line.availableQuantity}
                  lowStockThreshold={line.lowStockThreshold}
                />
                <PriceDisplay price={line.lineTotal} size="sm" />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Components total</span>
        <span className="font-semibold tracking-tight">{formatBdt(total)}</span>
      </div>
    </div>
  );
}
