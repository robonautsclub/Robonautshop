"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  FolderTree,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
  Bot,
} from "lucide-react";

import { ADMIN_NAV_GROUPS } from "@/lib/admin";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/products": Package,
  "/admin/categories": FolderTree,
  "/admin/inventory": Warehouse,
  "/admin/orders": ShoppingBag,
  "/admin/customers": Users,
  "/admin/kits": Boxes,
  "/admin/projects": Bot,
};

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AdminNav({ onNavigate, className }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className={cn("space-y-5", className)}>
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="mb-1.5 px-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = NAV_ICONS[item.href] ?? Package;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
