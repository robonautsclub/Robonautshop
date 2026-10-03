import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StatusPageAction = {
  href: string;
  label: string;
  variant?: "default" | "outline";
};

type StatusPageProps = {
  code?: string;
  title: string;
  description: string;
  primaryAction?: StatusPageAction;
  secondaryAction?: StatusPageAction;
  /** Custom actions (e.g. error `reset` button) rendered after link actions. */
  children?: ReactNode;
  /** Use `h2` when embedding inside a page that already has an `h1`. */
  titleAs?: "h1" | "h2";
  className?: string;
};

export function StatusPage({
  code,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
  titleAs: TitleTag = "h1",
  className,
}: StatusPageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-dashed px-6 py-12",
        className,
      )}
    >
      {code ? (
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          {code}
        </p>
      ) : null}
      <TitleTag
        className={cn(
          "font-semibold tracking-tight",
          TitleTag === "h1" ? "text-2xl" : "text-lg",
        )}
      >
        {title}
      </TitleTag>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {primaryAction || secondaryAction || children ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {primaryAction ? (
            <Link
              href={primaryAction.href}
              className={cn(
                buttonVariants({
                  variant: primaryAction.variant ?? "default",
                }),
              )}
            >
              {primaryAction.label}
            </Link>
          ) : null}
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              className={cn(
                buttonVariants({
                  variant: secondaryAction.variant ?? "outline",
                }),
              )}
            >
              {secondaryAction.label}
            </Link>
          ) : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}
