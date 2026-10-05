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
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/lib/admin";
import { formatAdminDateTime } from "@/lib/admin/format-date";
import { formatBdt } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function orderTone(status: AdminOrderStatus) {
  if (status === "DELIVERED") return "success" as const;
  if (status === "CANCELLED" || status === "REFUNDED") return "danger" as const;
  if (
    status === "PENDING" ||
    status === "PAYMENT_PENDING" ||
    status === "PAID" ||
    status === "PROCESSING" ||
    status === "PACKED"
  ) {
    return "warning" as const;
  }
  return "neutral" as const;
}

function paymentTone(status: AdminPaymentStatus) {
  if (status === "PAID") return "success" as const;
  if (status === "FAILED" || status === "REFUNDED" || status === "CANCELLED") {
    return "danger" as const;
  }
  return "warning" as const;
}

export function AdminOrderDetailShell({ order }: { order: AdminOrder }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={order.id}
        description={
          order.invoiceAvailable
            ? "Real order detail. Receipt is generated on demand (not stored)."
            : "Demo order detail. Receipt is generated on demand (not stored)."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/admin/orders/${order.id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Download receipt
            </a>
            <Link
              href="/admin/orders"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Back to orders
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-xl border bg-muted/20 p-4 sm:p-5">
          <h2 className="text-sm font-semibold tracking-tight">Customer</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{order.customerName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="break-all font-medium">{order.customerEmail}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">City</dt>
              <dd className="font-medium">{order.city}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Placed</dt>
              <dd className="font-medium">
                {formatAdminDateTime(order.placedAt)}
              </dd>
            </div>
          </dl>
          {order.specialInstructions ? (
            <div className="border-t pt-3">
              <p className="text-sm font-medium">Special instructions</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {order.specialInstructions}
              </p>
            </div>
          ) : null}
        </section>

        <section className="space-y-3 rounded-xl border bg-muted/20 p-4 sm:p-5">
          <h2 className="text-sm font-semibold tracking-tight">Status</h2>
          <div className="flex flex-wrap gap-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Order</p>
              <AdminStatusBadge tone={orderTone(order.orderStatus)}>
                {order.orderStatus}
              </AdminStatusBadge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Payment</p>
              <AdminStatusBadge tone={paymentTone(order.paymentStatus)}>
                {order.paymentStatus}
              </AdminStatusBadge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Payment method: {order.paymentMethod}
          </p>
          <p className="text-xs text-muted-foreground">
            Demo fixture only — order and payment status stay separate for the
            future real system.
          </p>
        </section>
      </div>

      <section className="rounded-xl border p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-tight">Items</h2>
        <AdminTable className="mt-4 border-0">
          <AdminTableHead sticky={false}>
            <AdminTh>Item</AdminTh>
            <AdminTh>Qty</AdminTh>
            <AdminTh className="text-right">Line total</AdminTh>
          </AdminTableHead>
          <tbody>
            {order.lines.map((line) => (
              <tr key={`${line.name}-${line.quantity}`}>
                <AdminTd>{line.name}</AdminTd>
                <AdminTd>{line.quantity}</AdminTd>
                <AdminTd className="text-right font-medium">
                  {formatBdt(line.lineTotal)}
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
        <div className="mt-4 space-y-2 border-t pt-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatBdt(order.subtotal)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Delivery charge</span>
            <span>{formatBdt(order.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between gap-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatBdt(order.total)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
