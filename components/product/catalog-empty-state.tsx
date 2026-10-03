import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CatalogEmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
};

export function CatalogEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  className,
}: CatalogEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-dashed px-6 py-12",
        className,
      )}
    >
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className={cn(buttonVariants({ variant: "outline" }), "mt-1")}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
