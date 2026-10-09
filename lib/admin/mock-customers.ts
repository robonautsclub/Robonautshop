/**
 * Development fixture customers for the admin customers shell
 * (tasks/phase-18-hardening/115). Not real user records.
 *
 * Profiles come from mock-people.ts; order count and spend are calculated
 * from the mock orders, never typed in, so they always match /admin/orders.
 */

import { MOCK_CUSTOMER_PROFILES } from "@/lib/admin/mock-people";
import { isRevenueOrder, listAdminOrders } from "@/lib/admin/mock-orders";

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  area: string;
  orderCount: number;
  /** Sum of PAID order totals in BDT (refunds and unpaid attempts excluded). */
  totalSpentBdt: number;
  lastOrderAt: string | null;
  createdAt: string;
};

export function listAdminCustomers(): AdminCustomer[] {
  const orders = listAdminOrders();

  return MOCK_CUSTOMER_PROFILES.map((profile) => {
    const own = orders.filter((order) => order.customerEmail === profile.email);
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
      area: profile.area,
      orderCount: own.length,
      totalSpentBdt: own
        .filter(isRevenueOrder)
        .reduce((sum, order) => sum + order.total, 0),
      lastOrderAt: own[0]?.placedAt ?? null,
      createdAt: profile.joinedAt,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}
