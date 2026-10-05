"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Search } from "lucide-react";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { SiteLogo } from "@/components/brand/site-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { getAdminSectionLabel } from "@/lib/admin";
import { cn } from "@/lib/utils";

export function AdminTopbar() {
  const pathname = usePathname();
  const section = getAdminSectionLabel(pathname);

  return (
    <div className="flex h-14 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <AdminMobileNav />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <SiteLogo
              href="/admin"
              size="sm"
              wordmark="Admin"
              className="lg:hidden"
              wordmarkClassName="text-sm"
            />
            <p className="hidden text-sm text-muted-foreground lg:inline">
              {section}
            </p>
            <p className="truncate text-sm font-medium lg:hidden">{section}</p>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden text-muted-foreground md:inline-flex"
          disabled
          title="Search"
        >
          <Search className="size-3.5" aria-hidden />
          Search
        </Button>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "lg:hidden",
          )}
        >
          <ExternalLink className="size-3.5" aria-hidden />
          Store
        </Link>
      </div>
    </div>
  );
}
