/** Shared invoice model used by email HTML and on-the-fly PDF (no R2 storage). */

export type OrderInvoiceLine = {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderInvoice = {
  orderId: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  couponCode?: string | null;
  total: number;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingPostalCode?: string | null;
  lines: OrderInvoiceLine[];
};
