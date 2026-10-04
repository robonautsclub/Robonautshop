import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { buttonVariants } from "@/components/ui/button";
import { getAdminFinanceSummary, listAdminOrders } from "@/lib/admin";
import { formatBdt } from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";
import { cn } from "@/lib/utils";

export async function AdminFinancesContent() {
  const db = await getRequestDb();
  const finance = await getAdminFinanceSummary(db);
  const orders = listAdminOrders();

  const codPending = orders.filter(
    (order) =>
      order.orderStatus !== "CANCELLED" &&
      order.paymentStatus === "PENDING" &&
      order.paymentMethod.toLowerCase().includes("cash"),
  );

  const paidOrders = orders.filter(
    (order) =>
      order.orderStatus !== "CANCELLED" && order.paymentStatus === "PAID",
  );

  const cards = [
    {
      label: "Stock value",
      value: formatBdt(finance.stockValueBdt),
      hint: `${finance.stockUnits} units · ${finance.stockSkuCount} SKUs`,
      tone: "neutral" as const,
    },
    {
      label: "Sales (paid)",
      value: formatBdt(finance.salesPaidBdt),
      hint: `${finance.salesPaidOrderCount} paid demo orders`,
      tone: "success" as const,
    },
    {
      label: "COD yet to receive",
      value: formatBdt(finance.codReceivableBdt),
      hint: `${finance.codReceivableOrderCount} Cash on Delivery orders pending payment`,
      tone: "warning" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Finances"
        description="Demo totals from mock inventory and orders — not live accounting."
        actions={
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View orders
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border p-5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{card.hint}</p>
            <div className="mt-3">
              <AdminStatusBadge tone={card.tone}>{card.label}</AdminStatusBadge>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-xl border p-5">
        <h2 className="text-lg font-semibold tracking-tight">
          Cash on Delivery — money yet to receive
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Orders with payment method COD and payment status PENDING. Stock may
          already be booked; cash is still outstanding.
        </p>
        {codPending.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No COD receivables in the demo fixture.
          </p>
        ) : (
          <AdminTable className="mt-4">
            <AdminTableHead>
              <AdminTh>Order</AdminTh>
              <AdminTh>Customer</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh className="text-right">Amount due</AdminTh>
            </AdminTableHead>
            <tbody>
              {codPending.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <AdminTd>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {order.id}
                    </Link>
                  </AdminTd>
                  <AdminTd>
                    <p>{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.city}
                    </p>
                  </AdminTd>
                  <AdminTd>
                    <AdminStatusBadge tone="warning">
                      {order.paymentStatus}
                    </AdminStatusBadge>
                  </AdminTd>
                  <AdminTd className="text-right font-medium">
                    {formatBdt(order.total)}
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="text-lg font-semibold tracking-tight">Paid sales</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo orders marked PAID (bKash, Nagad, or collected COD).
        </p>
        <AdminTable className="mt-4">
          <AdminTableHead>
            <AdminTh>Order</AdminTh>
            <AdminTh>Method</AdminTh>
            <AdminTh className="text-right">Total</AdminTh>
          </AdminTableHead>
          <tbody>
            {paidOrders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30">
                <AdminTd>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {order.id}
                  </Link>
                </AdminTd>
                <AdminTd>{order.paymentMethod}</AdminTd>
                <AdminTd className="text-right font-medium">
                  {formatBdt(order.total)}
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </section>
    </div>
  );
}
