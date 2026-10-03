import type { ReactNode } from "react";
import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { AdminShellNote } from "@/components/admin/admin-shell-note";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminLayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Robonautshop
            </p>
            <p className="text-sm font-semibold tracking-tight">Admin</p>
          </div>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Back to store
          </Link>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8 lg:py-8">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <AdminShellNote />
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
