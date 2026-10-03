import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { AdminShellNote } from "@/components/admin/admin-shell-note";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { PageContainer } from "@/components/layout/page-container";

export function AdminLayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/25">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <PageContainer>
          <AdminTopbar />
        </PageContainer>
      </header>

      <PageContainer className="py-6 lg:py-8">
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4 rounded-xl border bg-background p-4">
              <AdminShellNote />
              <AdminNav />
            </div>
          </aside>

          <main className="min-w-0 rounded-xl border bg-background p-4 sm:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </PageContainer>
    </div>
  );
}
