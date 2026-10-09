/**
 * Finance summaries for the admin Finances tab and dashboard
 * (tasks/phase-18-hardening/116). Stock value is live (D1 inventory);
 * order figures are calculated from the mock orders — development fixture
 * data, not live accounting. bKash is the only payment method.
 *
 * Cost of goods / margin is not shown: the catalog has no cost price yet.
 */

import { listAdminInventory, listAdminProducts } from "@/lib/admin/catalog";
import {
  isRevenueOrder,
  listAdminOrders,
  type AdminOrder,
} from "@/lib/admin/mock-orders";
import type { Database } from "@/lib/db";
import { canRepayWithBkash } from "@/lib/orders/repay-rules";

export type AdminMonthlyFinance = {
  /** `YYYY-MM` */
  month: string;
  revenueBdt: number;
  paidOrderCount: number;
  refundedBdt: number;
};

export type AdminOrderFinance = {
  salesPaidBdt: number;
  salesPaidOrderCount: number;
  averageOrderValueBdt: number;
  refundedBdt: number;
  refundedOrderCount: number;
  unpaidBkashBdt: number;
  unpaidBkashOrderCount: number;
  cancelledOrderCount: number;
  monthly: AdminMonthlyFinance[];
};

export type AdminFinanceSummary = AdminOrderFinance & {
  stockValueBdt: number;
  stockSkuCount: number;
  stockUnits: number;
};

/** A bKash attempt the customer has not completed (still repayable). */
export function isUnpaidBkashAttempt(order: AdminOrder): boolean {
  // Mock orders are all bKash (their paymentMethod holds the display label).
  return canRepayWithBkash({
    paymentMethod: "BKASH",
    paymentStatus: order.paymentStatus,
    status: order.orderStatus,
  });
}

/** Pure order math — one implementation for the dashboard and Finances tab. */
export function summarizeOrderFinance(orders: AdminOrder[]): AdminOrderFinance {
  const monthly = new Map<string, AdminMonthlyFinance>();
  const monthOf = (order: AdminOrder) => {
    const month = order.placedAt.slice(0, 7);
    const entry = monthly.get(month) ?? {
      month,
      revenueBdt: 0,
      paidOrderCount: 0,
      refundedBdt: 0,
    };
    monthly.set(month, entry);
    return entry;
  };

  let salesPaidBdt = 0;
  let salesPaidOrderCount = 0;
  let refundedBdt = 0;
  let refundedOrderCount = 0;
  let unpaidBkashBdt = 0;
  let unpaidBkashOrderCount = 0;
  let cancelledOrderCount = 0;

  for (const order of orders) {
    if (order.orderStatus === "CANCELLED") {
      cancelledOrderCount += 1;
    }

    if (isRevenueOrder(order)) {
      salesPaidBdt += order.total;
      salesPaidOrderCount += 1;
      const entry = monthOf(order);
      entry.revenueBdt += order.total;
      entry.paidOrderCount += 1;
    } else if (order.paymentStatus === "REFUNDED") {
      refundedBdt += order.total;
      refundedOrderCount += 1;
      monthOf(order).refundedBdt += order.total;
    } else if (isUnpaidBkashAttempt(order)) {
      unpaidBkashBdt += order.total;
      unpaidBkashOrderCount += 1;
    }
  }

  return {
    salesPaidBdt,
    salesPaidOrderCount,
    averageOrderValueBdt:
      salesPaidOrderCount > 0 ? Math.round(salesPaidBdt / salesPaidOrderCount) : 0,
    refundedBdt,
    refundedOrderCount,
    unpaidBkashBdt,
    unpaidBkashOrderCount,
    cancelledOrderCount,
    monthly: [...monthly.values()].sort((a, b) => b.month.localeCompare(a.month)),
  };
}

export async function getAdminFinanceSummary(
  db: Database,
): Promise<AdminFinanceSummary> {
  const [inventory, productRows] = await Promise.all([
    listAdminInventory(db),
    listAdminProducts(db),
  ]);
  const priceByProductId = new Map(
    productRows.map((product) => [product.id, product.price]),
  );
  let stockValueBdt = 0;
  let stockUnits = 0;

  for (const row of inventory) {
    const unitPrice = priceByProductId.get(row.productId) ?? 0;
    stockUnits += row.stockQuantity;
    stockValueBdt += row.stockQuantity * unitPrice;
  }

  return {
    stockValueBdt,
    stockSkuCount: inventory.length,
    stockUnits,
    ...summarizeOrderFinance(listAdminOrders()),
  };
}
