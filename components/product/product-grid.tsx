import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ProductGridProps = {
  children: ReactNode;
  className?: string;
};

export function ProductGrid({ children, className }: ProductGridProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
        className,
      )}
    >
      {children}
    </ul>
  );
}
