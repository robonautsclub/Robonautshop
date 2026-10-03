import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTableToolbarSearch,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { buttonVariants } from "@/components/ui/button";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/lib/admin";
import { formatBdt } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function orderTone(status: AdminOrderStatus) {
  if (status === "DELIVERED") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  if (status === "PENDING") return "warning" as const;
  return "neutral" as const;
}

function paymentTone(status: AdminPaymentStatus) {
  if (status === "PAID") return "success" as const;
  if (status === "FAILED" || status === "REFUNDED") return "danger" as const;
  return "warning" as const;
}

export function AdminOrdersShell({ orders }: { orders: AdminOrder[] }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description={`${orders.length} demo orders · not a real orders system.`}
        toolbar={
          <>
            <AdminTableToolbarSearch placeholder="Search orders (demo)" />
            <p className="text-xs text-muted-foreground">
              Order status and payment status are tracked separately
            </p>
          </>
        }
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Order</AdminTh>
          <AdminTh>Customer</AdminTh>
          <AdminTh>City</AdminTh>
          <AdminTh>Order status</AdminTh>
          <AdminTh>Payment</AdminTh>
          <AdminTh className="text-right">Total</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-muted/30">
              <AdminTd>
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.placedAt).toLocaleString()}
                  </p>
                </div>
              </AdminTd>
              <AdminTd>
                <div>
                  <p>{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.customerEmail}
                  </p>
                </div>
              </AdminTd>
              <AdminTd>{order.city}</AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={orderTone(order.orderStatus)}>
                  {order.orderStatus}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd>
                <div className="space-y-1">
                  <AdminStatusBadge tone={paymentTone(order.paymentStatus)}>
                    {order.paymentStatus}
                  </AdminStatusBadge>
                  <p className="text-xs text-muted-foreground">
                    {order.paymentMethod}
                  </p>
                </div>
              </AdminTd>
              <AdminTd className="text-right font-medium">
                {formatBdt(order.total)}
              </AdminTd>
              <AdminTd className="text-right">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                  )}
                >
                  View
                </Link>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
