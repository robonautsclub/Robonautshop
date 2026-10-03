import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  getAdminDashboardStats,
  listAdminOrders,
} from "@/lib/admin";
import { formatBdt } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function AdminDashboardContent() {
  const stats = getAdminDashboardStats();
  const recentOrders = listAdminOrders().slice(0, 5);

  const cards = [
    {
      label: "Products",
      value: String(stats.productCount),
      hint: `${stats.publishedProductCount} published`,
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: String(stats.categoryCount),
      hint: "Mock catalog",
      href: "/admin/categories",
    },
    {
      label: "Low stock SKUs",
      value: String(stats.lowStockCount),
      hint: `${stats.inventorySkuCount} inventory rows`,
      href: "/admin/inventory",
    },
    {
      label: "Kits",
      value: String(stats.kitCount),
      hint: "Mock kits",
      href: "/admin/kits",
    },
    {
      label: "Projects",
      value: String(stats.projectCount),
      hint: "Mock projects",
      href: "/admin/projects",
    },
    {
      label: "Demo orders",
      value: String(recentOrders.length > 0 ? listAdminOrders().length : 0),
      hint: "Static fixture only",
      href: "/admin/orders",
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="High-level mock stats for the admin UI shell. Not live analytics."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border p-5 transition-colors hover:border-foreground/20"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{card.hint}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-xl border p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent demo orders
          </h2>
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View all
          </Link>
        </div>
        <ul className="divide-y">
          {recentOrders.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
            >
              <div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {order.id}
                </Link>
                <p className="text-muted-foreground">
                  {order.customerName} · {order.city}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatBdt(order.total)}</p>
                <p className="text-muted-foreground">{order.orderStatus}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
