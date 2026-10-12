import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { buildListHref } from "@/lib/catalog/list-url";
import { cn } from "@/lib/utils";

type ProductPaginationProps = {
  basePath: string;
  /** Active filters to keep in every page link. */
  params: Record<string, string | string[] | undefined>;
  page: number;
  totalPages: number;
};

/** Page numbers to show: first, last, and a window around the current page. */
function visiblePages(page: number, totalPages: number): Array<number | "gap"> {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const result: Array<number | "gap"> = [];
  for (const n of sorted) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && n - previous > 1) {
      result.push("gap");
    }
    result.push(n);
  }
  return result;
}

/** Server-rendered, link-based pagination — the page number lives in the URL. */
export function ProductPagination({ basePath, params, page, totalPages }: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const href = (target: number) => buildListHref(basePath, params, target);
  const linkClass = (active: boolean) =>
    buttonVariants({ variant: active ? "default" : "outline", size: "sm" });

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={linkClass(false)}>
          Prev
        </Link>
      ) : null}
      {visiblePages(page, totalPages).map((entry, index) =>
        entry === "gap" ? (
          <span key={`gap-${index}`} aria-hidden className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={href(entry)}
            aria-label={`Page ${entry}`}
            aria-current={entry === page ? "page" : undefined}
            className={cn(linkClass(entry === page))}
          >
            {entry}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={linkClass(false)}>
          Next
        </Link>
      ) : null}
    </nav>
  );
}
