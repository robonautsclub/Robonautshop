import type { Permission } from "@/lib/auth/permissions";

export type AdminNavItem = {
  href: string;
  label: string;
  /** Permission needed to open the page; shown only to roles that hold it. */
  permission?: Permission;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard" },
      { permission: "analytics.view", href: "/admin/finances", label: "Finances" },
      { permission: "analytics.view", href: "/admin/analytics", label: "Analytics" },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      { permission: "catalog.manage", href: "/admin/products", label: "Products" },
      { permission: "catalog.manage", href: "/admin/categories", label: "Categories" },
      { permission: "inventory.manage", href: "/admin/inventory", label: "Inventory" },
    ],
  },
  {
    id: "fulfillment",
    label: "Fulfillment",
    items: [
      { permission: "orders.manage", href: "/admin/orders", label: "Orders" },
      { permission: "returns.manage", href: "/admin/returns", label: "Returns" },
      { permission: "coupons.manage", href: "/admin/coupons", label: "Coupons" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      { permission: "customers.view", href: "/admin/customers", label: "Customers" },
      { permission: "users.manage", href: "/admin/users", label: "Users" },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { permission: "catalog.manage", href: "/admin/kits", label: "Kits" },
      { permission: "catalog.manage", href: "/admin/projects", label: "Projects" },
      { permission: "questions.answer", href: "/admin/questions", label: "Questions" },
      { permission: "reviews.moderate", href: "/admin/reviews", label: "Reviews" },
    ],
  },
];

/** Flat list for callers that only need hrefs/labels. */
export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap(
  (group) => group.items,
);

export function getAdminSectionLabel(pathname: string): string {
  if (pathname === "/admin") {
    return "Dashboard";
  }

  const match = ADMIN_NAV.find(
    (item) =>
      item.href !== "/admin" &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );

  return match?.label ?? "Admin";
}
