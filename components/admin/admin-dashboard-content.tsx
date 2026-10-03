import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { buttonVariants } from "@/components/ui/button";
import {
  getAdminDashboardStats,
  listAdminCustomers,
  listAdminInventory,
  listAdminOrders,
} from "@/lib/admin";
import { formatBdt } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function orderTone(status: string) {
  if (status === "DELIVERED") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  if (status === "PENDING") return "warning" as const;
  return "neutral" as const;
}

export function AdminDashboardContent() {
  const stats = getAdminDashboardStats();
  const orders = listAdminOrders();
  const customers = listAdminCustomers();
  const recentOrders = orders.slice(0, 5);
  const lowStockRows = listAdminInventory()
    .filter((row) => row.availableQuantity <= row.lowStockThreshold)
    .slice(0, 5);

  const kpis = [
    {
      label: "Products",
      value: String(stats.productCount),
      hint: `${stats.publishedProductCount} published`,
      href: "/admin/products",
    },
    {
      label: "Orders",
      value: String(orders.length),
      hint: "Demo fixture",
      href: "/admin/orders",
    },
    {
      label: "Low stock",
      value: String(stats.lowStockCount),
      hint: `${stats.inventorySkuCount} SKUs tracked`,
      href: "/admin/inventory",
      warn: stats.lowStockCount > 0,
    },
    {
      label: "Customers",
      value: String(customers.length),
      hint: "Demo fixture",
      href: "/admin/customers",
    },
  ];

  const quickLinks = [
    { href: "/admin/products", label: "Manage products" },
    { href: "/admin/orders", label: "Review orders" },
    { href: "/admin/inventory", label: "Check inventory" },
    { href: "/admin/kits", label: "Edit kits" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Commerce overview from mock catalog and demo orders. Not live analytics."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.href + kpi.label}
            href={kpi.href}
            className={cn(
              "rounded-xl border p-4 transition-colors hover:border-foreground/20",
              kpi.warn && "border-amber-500/30 bg-amber-500/5",
            )}
          >
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {kpi.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {kpi.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{kpi.hint}</p>
          </Link>
        ))}
      </div>

      {stats.lowStockCount > 0 ? (
        <section className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className="size-4 text-amber-700 dark:text-amber-400"
                aria-hidden
              />
              <h2 className="text-sm font-semibold tracking-tight">
                Low stock attention
              </h2>
            </div>
            <Link
              href="/admin/inventory"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Open inventory
            </Link>
          </div>
          <ul className="divide-y divide-amber-500/20 text-sm">
            {lowStockRows.map((row) => (
              <li
                key={row.sku}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div>
                  <p className="font-medium">{row.productName}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {row.sku}
                  </p>
                </div>
                <AdminStatusBadge tone="warning">
                  {row.availableQuantity} available
                </AdminStatusBadge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View all
            </Link>
          </div>
          <AdminTable>
            <AdminTableHead>
              <AdminTh>Order</AdminTh>
              <AdminTh>Customer</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh className="text-right">Total</AdminTh>
            </AdminTableHead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <AdminTd>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {order.id}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.placedAt).toLocaleDateString()}
                    </p>
                  </AdminTd>
                  <AdminTd>
                    <p>{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.city}</p>
                  </AdminTd>
                  <AdminTd>
                    <AdminStatusBadge tone={orderTone(order.orderStatus)}>
                      {order.orderStatus}
                    </AdminStatusBadge>
                  </AdminTd>
                  <AdminTd className="text-right font-medium">
                    {formatBdt(order.total)}
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </section>

        <section className="rounded-xl border p-4">
          <h2 className="text-lg font-semibold tracking-tight">Quick links</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Jump to common admin sections.
          </p>
          <ul className="mt-4 space-y-1">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {link.label}
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t pt-4 text-sm text-muted-foreground">
            <p>
              Catalog: {stats.categoryCount} categories · {stats.kitCount} kits ·{" "}
              {stats.projectCount} projects
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
