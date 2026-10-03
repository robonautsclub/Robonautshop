import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  actions,
  toolbar,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("mb-6 space-y-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      {toolbar ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          {toolbar}
        </div>
      ) : null}
    </div>
  );
}
