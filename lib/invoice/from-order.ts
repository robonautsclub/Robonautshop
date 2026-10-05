import type { AdminOrder } from "@/lib/admin/mock-orders";
import type { OrderInvoice } from "@/lib/invoice/types";
import type { OrderItemRecord, OrderRecord } from "@/lib/server-cart/order-queries";

export type InvoiceCustomer = {
  name: string;
  email: string;
};

/** Map a persisted order + line items + customer into the shared invoice model. */
export function orderInvoiceFromOrder(
  order: OrderRecord,
  items: OrderItemRecord[],
  customer: InvoiceCustomer,
): OrderInvoice {
  return {
    orderId: order.id,
    createdAt: order.createdAt,
    customerName: customer.name,
    customerEmail: customer.email,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
    subtotal: order.subtotal,
    shippingTotal: order.shippingTotal,
    discountTotal: order.discountTotal,
    couponCode: order.couponCode,
    total: order.total,
    shippingFullName: order.shippingFullName,
    shippingPhone: order.shippingPhone,
    shippingAddressLine1: order.shippingAddressLine1,
    shippingAddressLine2: order.shippingAddressLine2,
    shippingCity: order.shippingCity,
    shippingPostalCode: order.shippingPostalCode,
    lines: items.map((item) => ({
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
  };
}

/**
 * Map a demo/fixture AdminOrder into the same invoice model so the
 * dashboard can generate a receipt for mock rows too (no D1 / R2).
 */
export function orderInvoiceFromAdminOrder(order: AdminOrder): OrderInvoice {
  return {
    orderId: order.id,
    createdAt: order.placedAt,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    subtotal: order.subtotal,
    shippingTotal: order.deliveryCharge,
    discountTotal: 0,
    couponCode: null,
    total: order.total,
    shippingFullName: order.customerName,
    shippingPhone: "—",
    shippingAddressLine1: order.city,
    shippingAddressLine2: null,
    shippingCity: order.city,
    shippingPostalCode: null,
    lines: order.lines.map((line, index) => ({
      productName: line.name,
      sku: `DEMO-${index + 1}`,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
    })),
  };
}

/** Short id for subjects / filenames (first 8 chars of the order id). */
export function shortOrderId(orderId: string): string {
  return orderId.slice(0, 8);
}

/** Stable download filename for the generated PDF. */
export function invoicePdfFilename(orderId: string): string {
  return `invoice-${shortOrderId(orderId)}.pdf`;
}
