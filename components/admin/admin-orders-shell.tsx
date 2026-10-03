"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminPagination,
  useAdminPagination,
} from "@/components/admin/admin-pagination";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTableToolbarSearch,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  bookOrderLines,
  ensureDemoOrderBookings,
  isOrderBooked,
  listAdminProducts,
  releaseOrderBooking,
  subscribeBookingStore,
  type AdminOrder,
  type AdminOrderStatus,
  type AdminPaymentStatus,
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
  const products = useMemo(() => listAdminProducts(), []);
  const [localOrders, setLocalOrders] = useState(orders);
  const [, setTick] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const pagination = useAdminPagination(localOrders, 20);

  useEffect(() => {
    queueMicrotask(() => {
      ensureDemoOrderBookings(orders, (lineName) => {
        const match = products.find(
          (product) =>
            product.name.toLowerCase() === lineName.toLowerCase() ||
            lineName.toLowerCase().includes(product.name.toLowerCase()) ||
            product.name.toLowerCase().includes(lineName.toLowerCase()),
        );
        return match?.sku ?? null;
      });
      setTick((n) => n + 1);
    });
  }, [orders, products]);

  useEffect(() => subscribeBookingStore(() => setTick((n) => n + 1)), []);

  function cancelOrder(order: AdminOrder) {
    releaseOrderBooking(order.id);
    setLocalOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? { ...item, orderStatus: "CANCELLED" as const }
          : item,
      ),
    );
    setMessage(
      `Demo only — ${order.id} cancelled. Booked units released back to available.`,
    );
  }

  function rebookOrder(order: AdminOrder) {
    const lines = order.lines
      .map((line) => {
        const match = products.find(
          (product) =>
            product.name.toLowerCase() === line.name.toLowerCase() ||
            line.name.toLowerCase().includes(product.name.toLowerCase()),
        );
        return match
          ? { sku: match.sku, quantity: line.quantity }
          : null;
      })
      .filter((line): line is { sku: string; quantity: number } =>
        Boolean(line),
      );
    bookOrderLines(order.id, lines);
    setLocalOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? { ...item, orderStatus: "PROCESSING" as const }
          : item,
      ),
    );
    setMessage(`Demo only — ${order.id} booked again against stock.`);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description={`${localOrders.length} demo orders · cancel releases booked stock.`}
        toolbar={
          <>
            <AdminTableToolbarSearch placeholder="Search orders (demo)" />
            <p className="text-xs text-muted-foreground">
              Order status and payment status stay separate
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
          <AdminTh>Booking</AdminTh>
          <AdminTh className="text-right">Total</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody>
          {pagination.pageItems.map((order) => {
            const booked = isOrderBooked(order.id);
            return (
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
                <AdminTd>
                  <AdminStatusBadge tone={booked ? "warning" : "neutral"}>
                    {booked ? "Booked" : "Not booked"}
                  </AdminStatusBadge>
                </AdminTd>
                <AdminTd className="text-right font-medium">
                  {formatBdt(order.total)}
                </AdminTd>
                <AdminTd className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      View
                    </Link>
                    {order.orderStatus !== "CANCELLED" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelOrder(order)}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => rebookOrder(order)}
                      >
                        Rebook demo
                      </Button>
                    )}
                  </div>
                </AdminTd>
              </tr>
            );
          })}
        </tbody>
      </AdminTable>

      <AdminPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
