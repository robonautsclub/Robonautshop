"use client";

import Link from "next/link";
import { useState } from "react";
import { Scale } from "lucide-react";

import { toggleCompare, useCompareSlugs } from "@/components/compare/compare-store";
import { Button } from "@/components/ui/button";
import { COMPARE_MAX } from "@/lib/compare/rows";

type CompareToggleProps = {
  slug: string;
  productName: string;
  /** Compact icon-only style for product cards. */
  compact?: boolean;
};

export function CompareToggle({ slug, productName, compact = false }: CompareToggleProps) {
  const slugs = useCompareSlugs();
  const [message, setMessage] = useState<string | null>(null);
  const selected = slugs.includes(slug);

  function onClick() {
    setMessage(null);
    if (!toggleCompare(slug)) {
      setMessage(`You can compare up to ${COMPARE_MAX} products.`);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant={selected ? "default" : "outline"}
        size={compact ? "icon-sm" : "default"}
        className={compact ? undefined : "gap-2"}
        onClick={onClick}
        aria-pressed={selected}
        aria-label={`${selected ? "Remove" : "Add"} ${productName} ${selected ? "from" : "to"} comparison`}
      >
        <Scale className="size-4" aria-hidden />
        {compact ? null : selected ? "In comparison" : "Compare"}
      </Button>
      {!compact && slugs.length > 0 ? (
        <Link href="/compare" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          View comparison ({slugs.length})
        </Link>
      ) : null}
      {message ? (
        <p className="text-xs text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
