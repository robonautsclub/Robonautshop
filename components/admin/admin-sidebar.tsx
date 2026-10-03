import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { AdminShellNote } from "@/components/admin/admin-shell-note";
import { AdminSidebarLogout } from "@/components/admin/admin-sidebar-logout";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-background", className)}>
      <div className="shrink-0 border-b px-4 py-4">
        <Link href="/admin" className="block" onClick={onNavigate}>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Robonautshop
          </p>
          <p className="text-sm font-semibold tracking-tight">Admin</p>
        </Link>
        <div className="mt-3">
          <AdminShellNote />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <AdminNav onNavigate={onNavigate} />
      </div>

      <AdminSidebarLogout onLogout={onNavigate} />
    </div>
  );
}
