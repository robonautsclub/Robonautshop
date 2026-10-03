/**
 * Demo finance summaries for the admin Finances tab.
 * Derived from mock catalog inventory + demo orders — not live accounting.
 */

import { listAdminInventory } from "@/lib/admin/catalog";
import { listAdminOrders } from "@/lib/admin/mock-orders";
import { getProductById } from "@/lib/catalog";

export type AdminFinanceSummary = {
  stockValueBdt: number;
  stockSkuCount: number;
  stockUnits: number;
  salesPaidBdt: number;
  salesPaidOrderCount: number;
  codReceivableBdt: number;
  codReceivableOrderCount: number;
  cancelledOrderCount: number;
};

function isCashOnDelivery(method: string) {
  const normalized = method.toLowerCase();
  return (
    normalized.includes("cash on delivery") ||
    normalized === "cod" ||
    normalized.includes("cash on")
  );
}

export function getAdminFinanceSummary(): AdminFinanceSummary {
  const inventory = listAdminInventory();
  let stockValueBdt = 0;
  let stockUnits = 0;

  for (const row of inventory) {
    const product = getProductById(row.productId);
    const unitPrice = product?.price ?? 0;
    stockUnits += row.stockQuantity;
    stockValueBdt += row.stockQuantity * unitPrice;
  }

  const orders = listAdminOrders();
  let salesPaidBdt = 0;
  let salesPaidOrderCount = 0;
  let codReceivableBdt = 0;
  let codReceivableOrderCount = 0;
  let cancelledOrderCount = 0;

  for (const order of orders) {
    if (order.orderStatus === "CANCELLED") {
      cancelledOrderCount += 1;
      continue;
    }

    if (order.paymentStatus === "PAID") {
      salesPaidBdt += order.total;
      salesPaidOrderCount += 1;
      continue;
    }

    if (
      isCashOnDelivery(order.paymentMethod) &&
      order.paymentStatus === "PENDING"
    ) {
      codReceivableBdt += order.total;
      codReceivableOrderCount += 1;
    }
  }

  return {
    stockValueBdt,
    stockSkuCount: inventory.length,
    stockUnits,
    salesPaidBdt,
    salesPaidOrderCount,
    codReceivableBdt,
    codReceivableOrderCount,
    cancelledOrderCount,
  };
}
