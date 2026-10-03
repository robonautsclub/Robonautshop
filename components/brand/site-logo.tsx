import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const SIZE_PX = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
} as const;

type SiteLogoProps = {
  href?: string | null;
  size?: keyof typeof SIZE_PX;
  showWordmark?: boolean;
  wordmark?: string;
  className?: string;
  imageClassName?: string;
  wordmarkClassName?: string;
  priority?: boolean;
};

export function SiteLogo({
  href = "/",
  size = "md",
  showWordmark = true,
  wordmark = "Robonautshop",
  className,
  imageClassName,
  wordmarkClassName,
  priority = false,
}: SiteLogoProps) {
  const px = SIZE_PX[size];
  const mark = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2",
        className,
      )}
    >
      <Image
        src="/logo.png"
        alt={showWordmark ? "" : wordmark}
        width={px}
        height={px}
        priority={priority}
        unoptimized
        className={cn("shrink-0 object-contain", imageClassName)}
        style={{ width: px, height: px, maxWidth: "none" }}
      />
      {showWordmark ? (
        <span
          className={cn(
            "truncate font-semibold tracking-tight",
            size === "sm" && "text-sm",
            size === "md" && "text-base",
            size === "lg" && "text-xl",
            size === "xl" && "text-2xl sm:text-3xl",
            wordmarkClassName,
          )}
        >
          {wordmark}
        </span>
      ) : null}
    </span>
  );

  if (href === null) {
    return mark;
  }

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={wordmark}
    >
      {mark}
    </Link>
  );
}
