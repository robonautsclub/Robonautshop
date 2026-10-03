import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

type RouteLoadingProps = {
  className?: string;
  /** Slightly denser placeholder for admin tables. */
  variant?: "store" | "admin";
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted", className)}
      aria-hidden
    />
  );
}

export function RouteLoading({
  className,
  variant = "store",
}: RouteLoadingProps) {
  return (
    <PageContainer as="section" className={cn("py-10", className)}>
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading…</span>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <SkeletonBlock className="h-8 w-48 max-w-full" />
            <SkeletonBlock className="h-4 w-80 max-w-full" />
          </div>
          {variant === "admin" ? (
            <div className="flex flex-col gap-3">
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-3/4" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SkeletonBlock className="h-48 w-full" />
              <SkeletonBlock className="h-48 w-full" />
              <SkeletonBlock className="h-48 w-full" />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
