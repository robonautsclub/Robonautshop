/**
 * Snapshot stored on `bkash_pending_payments.payload` until Execute succeeds
 * and a real order row is written.
 */
export type BkashPendingLine = {
  productId: string;
  variantId: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type BkashPendingPayload = {
  lines: BkashPendingLine[];
  address: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
  };
  location?: { lat: number; lng: number } | null;
  specialInstructions?: string;
  subtotal: number;
  shippingTotal: number;
  total: number;
};

export function parseBkashPendingPayload(raw: string): BkashPendingPayload {
  return JSON.parse(raw) as BkashPendingPayload;
}
