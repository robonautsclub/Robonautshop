import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AdminTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border bg-background",
        className,
      )}
    >
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function AdminTableHead({
  children,
  sticky = true,
}: {
  children: ReactNode;
  sticky?: boolean;
}) {
  return (
    <thead
      className={cn(
        "border-b bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase",
        sticky && "sticky top-0 z-10",
      )}
    >
      <tr>{children}</tr>
    </thead>
  );
}

export function AdminTh({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-2.5 font-medium whitespace-nowrap", className)}>
      {children}
    </th>
  );
}

export function AdminTd({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("border-t px-4 py-2.5 align-middle", className)}>
      {children}
    </td>
  );
}

export function AdminTableToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminTableToolbarSearch({
  placeholder = "Search…",
  disabled = true,
}: {
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="search"
      placeholder={placeholder}
      disabled={disabled}
      aria-label={placeholder}
      className="h-8 w-full max-w-xs rounded-lg border bg-background px-3 text-sm text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-70"
    />
  );
}

export function AdminStatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "success" &&
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        tone === "warning" &&
          "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        tone === "danger" && "bg-destructive/10 text-destructive",
      )}
    >
      {children}
    </span>
  );
}
