import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminStatusBadge,
} from "@/components/admin/admin-table";
import { buttonVariants } from "@/components/ui/button";
import type { AdminOrder } from "@/lib/admin";
import { formatBdt } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function AdminOrderDetailShell({ order }: { order: AdminOrder }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={order.id}
        description="Demo order detail shell. Status changes are not available yet."
        actions={
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Back to orders
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-xl border p-5">
          <h2 className="font-semibold tracking-tight">Customer</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{order.customerName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{order.customerEmail}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">City</dt>
              <dd className="font-medium">{order.city}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Placed</dt>
              <dd className="font-medium">
                {new Date(order.placedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
          {order.specialInstructions ? (
            <div className="border-t pt-3">
              <p className="text-sm font-medium">Special instructions</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.specialInstructions}
              </p>
            </div>
          ) : null}
        </section>

        <section className="space-y-3 rounded-xl border p-5">
          <h2 className="font-semibold tracking-tight">Status</h2>
          <div className="flex flex-wrap gap-2">
            <AdminStatusBadge>{order.orderStatus}</AdminStatusBadge>
            <AdminStatusBadge>{order.paymentStatus}</AdminStatusBadge>
          </div>
          <p className="text-sm text-muted-foreground">
            Payment method: {order.paymentMethod}
          </p>
          <p className="text-sm text-muted-foreground">
            Demo fixture only — order and payment status are separate fields for
            the future real system.
          </p>
        </section>
      </div>

      <section className="rounded-xl border p-5">
        <h2 className="font-semibold tracking-tight">Items</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {order.lines.map((line) => (
            <li
              key={`${line.name}-${line.quantity}`}
              className="flex justify-between gap-3"
            >
              <span className="text-muted-foreground">
                {line.name} × {line.quantity}
              </span>
              <span className="font-medium">{formatBdt(line.lineTotal)}</span>
            </li>
          ))}
        </ul>
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
