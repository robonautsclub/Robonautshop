import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer";
};

export function PageContainer({
  children,
  className,
  as: Comp = "div",
}: PageContainerProps) {
  return (
    <Comp className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </Comp>
  );
}
