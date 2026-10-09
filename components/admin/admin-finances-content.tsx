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
import { isUnpaidBkashAttempt } from "@/lib/admin/finances";
import { formatBdt } from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";
import { cn } from "@/lib/utils";

export async function AdminFinancesContent() {
  const db = await getRequestDb();
  const finance = await getAdminFinanceSummary(db);
  const orders = listAdminOrders();

  const unpaidAttempts = orders.filter(isUnpaidBkashAttempt);
  const paidOrders = orders.filter((order) => order.paymentStatus === "PAID");
  const monthFormatter = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

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
      hint: `${finance.salesPaidOrderCount} paid orders · avg ${formatBdt(finance.averageOrderValueBdt)}`,
      tone: "success" as const,
    },
    {
      label: "Unpaid bKash",
      value: formatBdt(finance.unpaidBkashBdt),
      hint: `${finance.unpaidBkashOrderCount} attempts the customer can still pay`,
      tone: "warning" as const,
    },
    {
      label: "Refunded",
      value: formatBdt(finance.refundedBdt),
      hint: `${finance.refundedOrderCount} refunded orders`,
      tone: "danger" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Finances"
        description="Order and payment totals. Stock value is live; order figures come from demo orders."
        actions={
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View orders
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
        <h2 className="text-lg font-semibold tracking-tight">By month</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paid revenue and refunds per month.
        </p>
        <AdminTable className="mt-4">
          <AdminTableHead>
            <AdminTh>Month</AdminTh>
            <AdminTh>Paid orders</AdminTh>
            <AdminTh className="text-right">Refunded</AdminTh>
            <AdminTh className="text-right">Revenue</AdminTh>
          </AdminTableHead>
          <tbody>
            {finance.monthly.map((row) => (
              <tr key={row.month} className="hover:bg-muted/30">
                <AdminTd className="font-medium">
                  {monthFormatter.format(new Date(`${row.month}-01T00:00:00.000Z`))}
                </AdminTd>
                <AdminTd>{row.paidOrderCount}</AdminTd>
                <AdminTd className="text-right text-muted-foreground">
                  {row.refundedBdt > 0 ? formatBdt(row.refundedBdt) : "—"}
                </AdminTd>
                <AdminTd className="text-right font-medium">
                  {formatBdt(row.revenueBdt)}
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="text-lg font-semibold tracking-tight">
          Unpaid bKash attempts
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Orders whose bKash payment failed, was cancelled, or is still pending.
          They hold no stock; the customer can pay again from their account.
        </p>
        {unpaidAttempts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No unpaid attempts.
          </p>
        ) : (
          <AdminTable className="mt-4">
            <AdminTableHead>
              <AdminTh>Order</AdminTh>
              <AdminTh>Customer</AdminTh>
              <AdminTh>Payment</AdminTh>
              <AdminTh className="text-right">Amount</AdminTh>
            </AdminTableHead>
            <tbody>
              {unpaidAttempts.map((order) => (
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
          Orders marked PAID.
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
