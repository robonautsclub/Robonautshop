"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ADMIN_PAGE_SIZES = [20, 30, 50] as const;
export type AdminPageSize = (typeof ADMIN_PAGE_SIZES)[number];

export function useAdminPagination<T>(
  items: T[],
  initialPageSize: AdminPageSize = 20,
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<AdminPageSize>(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  function changePageSize(next: AdminPageSize) {
    setPageSize(next);
    setPage(1);
  }

  function goToPage(next: number) {
    setPage(Math.min(totalPages, Math.max(1, next)));
  }

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    pageItems,
    setPage: goToPage,
    setPageSize: changePageSize,
  };
}

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: AdminPageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: AdminPageSize) => void;
  className?: string;
};

export function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className,
}: AdminPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    0,
    12,
  );

  return (
    <div
      className={cn(
        "mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>
          {totalItems === 0
            ? "0 items"
            : `Page ${page} of ${totalPages} · ${totalItems} items`}
        </span>
        <label className="flex items-center gap-2">
          <span className="sr-only">Rows per page</span>
          <select
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange(Number(event.target.value) as AdminPageSize)
            }
            className="h-8 rounded-lg border bg-background px-2 text-sm"
          >
            {ADMIN_PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            variant={pageNumber === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
