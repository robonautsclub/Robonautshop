/**
 * Demo inventory booking overlays for the admin shell.
 * available = stock − booked. Cancelled orders release booked qty.
 */

export type BookingLine = {
  sku: string;
  quantity: number;
};

type BookingStore = {
  /** orderId → booked lines */
  byOrder: Record<string, BookingLine[]>;
};

const store: BookingStore = {
  byOrder: {},
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeBookingStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getBookedQuantityForSku(sku: string): number {
  let total = 0;
  for (const lines of Object.values(store.byOrder)) {
    for (const line of lines) {
      if (line.sku === sku) {
        total += line.quantity;
      }
    }
  }
  return total;
}

export function getBookingsByOrder(): Record<string, BookingLine[]> {
  return { ...store.byOrder };
}

export function bookOrderLines(orderId: string, lines: BookingLine[]) {
  store.byOrder[orderId] = lines.filter((line) => line.quantity > 0);
  emit();
}

export function releaseOrderBooking(orderId: string) {
  delete store.byOrder[orderId];
  emit();
}

export function isOrderBooked(orderId: string): boolean {
  return Boolean(store.byOrder[orderId]?.length);
}

/** Seed demo bookings once for open (non-cancelled) fixture orders. */
let seeded = false;

export function ensureDemoOrderBookings(
  orders: Array<{
    id: string;
    orderStatus: string;
    lines: Array<{ name: string; quantity: number }>;
  }>,
  resolveSku: (lineName: string) => string | null,
) {
  if (seeded) return;
  seeded = true;

  for (const order of orders) {
    if (order.orderStatus === "CANCELLED" || order.orderStatus === "DELIVERED") {
      continue;
    }
    const lines: BookingLine[] = [];
    for (const line of order.lines) {
      const sku = resolveSku(line.name);
      if (sku) {
        lines.push({ sku, quantity: line.quantity });
      }
    }
    if (lines.length > 0) {
      store.byOrder[order.id] = lines;
    }
  }
}
