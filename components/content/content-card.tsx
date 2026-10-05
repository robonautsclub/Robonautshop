import Link from "next/link";

import { cn } from "@/lib/utils";

type ContentCardProps = {
  href: string;
  title: string;
  description: string;
  meta?: string;
  badge?: string;
  className?: string;
};

export function ContentCard({
  href,
  title,
  description,
  meta,
  badge,
  className,
}: ContentCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col rounded-xl border p-5 transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-medium tracking-tight">{title}</h2>
        {badge ? (
          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{description}</p>
      {meta ? <p className="mt-3 text-xs text-muted-foreground">{meta}</p> : null}
    </Link>
  );
}
