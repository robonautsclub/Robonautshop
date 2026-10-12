/**
 * Development fixture orders for the admin orders shell
 * (tasks/phase-18-hardening/114). Not a real orders system — real orders
 * come from D1 and are listed first on /admin/orders.
 *
 * Generated deterministically (fixed seed, fixed anchor date) so every
 * render shows the same data, from the same mock catalog that seeds D1:
 * line items are real catalog products/variants at their catalog prices,
 * totals add up, delivery uses the store's shipping rule, and payment is
 * bKash only (AGENTS.md §17).
 */

import { mockProducts, mockVariants } from "@/lib/catalog/mock-data";
import { estimateShippingBdt } from "@/lib/checkout/types";
import {
  MOCK_CUSTOMER_PROFILES,
  MOCK_CUSTOMERS_WITHOUT_ORDERS,
  type MockCustomerProfile,
} from "@/lib/admin/mock-people";

/** Matches D1 order statuses so real-order detail fallback can render without remapping. */
export type AdminOrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAID"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type AdminPaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export type AdminOrderLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type AdminOrder = {
  id: string;
  placedAt: string;
  customerName: string;
  customerEmail: string;
  city: string;
  orderStatus: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  paymentMethod: string;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  lines: AdminOrderLine[];
  specialInstructions?: string;
  /** True for real D1 orders — receipt/invoice PDF can be generated on demand. */
  invoiceAvailable?: boolean;
};

const MOCK_ORDER_SEED = 18_114;
/** Newest mock order date — fixed so the fixtures never shift between renders. */
const ANCHOR = Date.parse("2026-10-08T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const ORDER_COUNT = 32;

/** Small deterministic PRNG (mulberry32) — keeps faker's global seed untouched. */
function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = ReturnType<typeof createRng>;

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

const SPECIAL_INSTRUCTIONS = [
  "Please call before delivery.",
  "Deliver after 5 PM, office hours before that.",
  "Leave with the building guard if I'm not home.",
  "University hall address — ask for room 214.",
  "Needed for a robotics competition this weekend, please hurry.",
];

/**
 * Status pairs by how old the order is: recent orders are still moving,
 * older ones are mostly delivered, with the occasional unpaid bKash
 * attempt, cancellation, or refund — the mix a real shop sees.
 */
function statusFor(
  ageIndex: number,
  rng: Rng,
): { orderStatus: AdminOrderStatus; paymentStatus: AdminPaymentStatus } {
  const roll = rng();
  if (roll < 0.08) return { orderStatus: "PAYMENT_PENDING", paymentStatus: "FAILED" };
  if (roll < 0.12) return { orderStatus: "CANCELLED", paymentStatus: "CANCELLED" };
  if (roll < 0.15 && ageIndex > 6) return { orderStatus: "CANCELLED", paymentStatus: "REFUNDED" };
  if (roll < 0.17 && ageIndex > 12) return { orderStatus: "REFUNDED", paymentStatus: "REFUNDED" };

  const paid = { paymentStatus: "PAID" as const };
  if (ageIndex < 2) return { orderStatus: "PAID", ...paid };
  if (ageIndex < 5) return { orderStatus: "PROCESSING", ...paid };
  if (ageIndex < 7) return { orderStatus: "PACKED", ...paid };
  if (ageIndex < 10) return { orderStatus: "SHIPPED", ...paid };
  return { orderStatus: "DELIVERED", ...paid };
}

function buildLines(rng: Rng): AdminOrderLine[] {
  const lineCount = 1 + Math.floor(rng() * 4);
  const lines: AdminOrderLine[] = [];
  const used = new Set<string>();

  while (lines.length < lineCount) {
    const product = pick(rng, mockProducts);
    if (used.has(product.id)) continue;
    used.add(product.id);

    const variants = mockVariants.filter((variant) => variant.productId === product.id);
    const variant = variants.length > 0 ? pick(rng, variants) : null;
    const unitPrice = variant?.price ?? product.price;
    // Motors and wheels are bought in pairs for a 2WD build; cheap parts
    // (wires, headers, sensors) sometimes as spares; boards and chassis singly.
    const pairs = /motor|wheel/i.test(product.name) && !/driver/i.test(product.name);
    const spare = unitPrice < 300 && rng() < 0.3;
    const quantity = pairs || spare ? 2 : 1;

    lines.push({
      name: variant ? `${product.name} · ${variant.name}` : product.name,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    });
  }

  return lines;
}

function generateMockOrders(): AdminOrder[] {
  const rng = createRng(MOCK_ORDER_SEED);
  const buyers = MOCK_CUSTOMER_PROFILES.filter(
    (profile) => !MOCK_CUSTOMERS_WITHOUT_ORDERS.has(profile.id),
  );
  const orders: AdminOrder[] = [];

  for (let ageIndex = 0; ageIndex < ORDER_COUNT; ageIndex += 1) {
    // ~3.5 days apart, placed between 9 AM and 11 PM Bangladesh time (UTC+6).
    const day = new Date(ANCHOR - ageIndex * 3.5 * DAY_MS);
    day.setUTCHours(3 + Math.floor(rng() * 14), Math.floor(rng() * 60), 0, 0);
    const placedAt = day.toISOString();

    const eligible = buyers.filter((profile) => profile.joinedAt <= placedAt);
    const customer: MockCustomerProfile = pick(rng, eligible.length > 0 ? eligible : buyers);

    const lines = buildLines(rng);
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const deliveryCharge = estimateShippingBdt(customer.city).amount;
    const instructions = rng() < 0.25 ? pick(rng, SPECIAL_INSTRUCTIONS) : undefined;

    orders.push({
      id: `DEMO-${1001 + ORDER_COUNT - 1 - ageIndex}`,
      placedAt,
      customerName: customer.name,
      customerEmail: customer.email,
      city: customer.city,
      ...statusFor(ageIndex, rng),
      paymentMethod: "bKash",
      subtotal,
      deliveryCharge,
      total: subtotal + deliveryCharge,
      lines,
      ...(instructions ? { specialInstructions: instructions } : {}),
    });
  }

  return orders;
}

export const mockAdminOrders: AdminOrder[] = generateMockOrders();

/**
 * The one "money we keep" rule for mock-order reporting (customer spend,
 * finances): paid and not refunded. Unpaid bKash attempts never count.
 */
export function isRevenueOrder(order: Pick<AdminOrder, "paymentStatus">): boolean {
  return order.paymentStatus === "PAID";
}

export function listAdminOrders(): AdminOrder[] {
  return [...mockAdminOrders].sort(
    (a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt),
  );
}

export function getAdminOrderById(id: string): AdminOrder | null {
  return mockAdminOrders.find((order) => order.id === id) ?? null;
}
