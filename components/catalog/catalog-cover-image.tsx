import Image from "next/image";

import { cn } from "@/lib/utils";

type CatalogCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function CatalogCoverImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: CatalogCoverImageProps) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] overflow-hidden bg-muted",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}
