import { z } from "zod";

import { ORDER_STATUS_VALUES, PAYMENT_STATUS_VALUES } from "@/lib/db/schema/shared";

/**
 * Admin order search/filter params (tasks/phase-19-admin-catalog/126).
 * Lives in the URL, so it is parsed leniently: anything invalid is simply
 * dropped instead of erroring the page.
 */

const dateParam = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

export const adminOrderFiltersSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined).transform((value) => value || undefined),
  status: z.enum(ORDER_STATUS_VALUES).optional().catch(undefined),
  payment: z.enum(PAYMENT_STATUS_VALUES).optional().catch(undefined),
  from: dateParam,
  to: dateParam,
});

export type AdminOrderFilters = Partial<z.output<typeof adminOrderFiltersSchema>>;

export function parseAdminOrderFilters(
  params: Record<string, string | string[] | undefined>,
): AdminOrderFilters {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  return adminOrderFiltersSchema.parse({
    q: first(params.q),
    status: first(params.status),
    payment: first(params.payment),
    from: first(params.from),
    to: first(params.to),
  });
}

export function hasAdminOrderFilters(filters: AdminOrderFilters): boolean {
  return Object.values(filters).some((value) => value !== undefined);
}

/** "YYYY-MM-DD" of the day after `date` — the exclusive upper bound for a `to` filter. */
export function nextDay(date: string): string {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

/** Escapes LIKE wildcards so a search for "50%" matches literally (used with ESCAPE '\'). */
export function likeContains(text: string): string {
  return `%${text.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}

/**
 * The same rules applied in memory — only for the development fixture
 * orders that are not in D1. Real orders are filtered in the SQL query.
 */
export function matchesAdminOrderFilters(
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    phone?: string;
    orderStatus: string;
    paymentStatus: string;
    placedAt: string;
  },
  filters: AdminOrderFilters,
): boolean {
  if (filters.status && order.orderStatus !== filters.status) return false;
  if (filters.payment && order.paymentStatus !== filters.payment) return false;
  const day = order.placedAt.slice(0, 10);
  if (filters.from && day < filters.from) return false;
  if (filters.to && day > filters.to) return false;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    return [order.id, order.customerName, order.customerEmail, order.phone ?? ""].some((value) =>
      value.toLowerCase().includes(q),
    );
  }
  return true;
}
