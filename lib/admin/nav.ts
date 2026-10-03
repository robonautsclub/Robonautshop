export type AdminNavItem = {
  href: string;
  label: string;
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
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/inventory", label: "Inventory" },
    ],
  },
  {
    id: "fulfillment",
    label: "Fulfillment",
    items: [{ href: "/admin/orders", label: "Orders" }],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/users", label: "Users" },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { href: "/admin/kits", label: "Kits" },
      { href: "/admin/projects", label: "Projects" },
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
