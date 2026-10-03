"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Search } from "lucide-react";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminShellNote } from "@/components/admin/admin-shell-note";
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
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-semibold tracking-tight lg:hidden">
              Robonautshop Admin
            </p>
            <p className="hidden text-sm text-muted-foreground lg:inline">
              {section}
            </p>
            <p className="truncate text-sm font-medium lg:hidden">{section}</p>
          </div>
          <div className="mt-0.5 lg:hidden">
            <AdminShellNote compact />
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
          title="Search comes in a later phase"
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
