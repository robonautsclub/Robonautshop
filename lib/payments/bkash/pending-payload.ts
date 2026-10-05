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
  /** Coupon discount in BDT, if one was applied (tasks/phase-14-advanced/87-coupons.md). */
  discountTotal?: number;
  couponId?: string | null;
  couponCode?: string | null;
  total: number;
};

export function parseBkashPendingPayload(raw: string): BkashPendingPayload {
  const parsed = JSON.parse(raw) as BkashPendingPayload;
  // Defensive defaults for payloads staged before the coupon fields existed.
  return {
    discountTotal: 0,
    couponId: null,
    couponCode: null,
    ...parsed,
  };
}
