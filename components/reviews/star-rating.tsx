import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Read-only star display, e.g. "4.3 out of 5". */
export function StarRating({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const rounded = Math.round(value);
  const iconSize = size === "md" ? "size-5" : "size-4";

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={cn(
            iconSize,
            index < rounded ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}
