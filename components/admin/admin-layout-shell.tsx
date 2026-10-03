import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { PageContainer } from "@/components/layout/page-container";

export function AdminLayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh bg-muted/25">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-r bg-background lg:flex xl:w-72">
        <AdminSidebar className="w-full" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <PageContainer className="lg:px-8 xl:px-10">
            <AdminTopbar />
          </PageContainer>
        </header>

        <PageContainer className="flex-1 py-6 lg:px-8 lg:py-8 xl:px-10">
          <main className="min-w-0 rounded-xl border bg-background p-4 sm:p-5 lg:p-6">
            {children}
          </main>
        </PageContainer>
      </div>
    </div>
  );
}
