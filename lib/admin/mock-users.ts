/**
 * Development fixture users for the admin Users shell
 * (tasks/phase-18-hardening/115). Not real accounts.
 *
 * Staff are listed here; shoppers are the same people as the mock
 * customers (mock-people.ts), so the Users and Customers tabs agree.
 */

import { MOCK_CUSTOMER_PROFILES } from "@/lib/admin/mock-people";

export type AdminUserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STORE_MANAGER"
  | "SHOPPER";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: "ACTIVE" | "INVITED" | "DISABLED";
  createdAt: string;
};

export const ADMIN_ROLE_MATRIX: Array<{
  role: AdminUserRole;
  label: string;
  access: string;
}> = [
  {
    role: "SUPER_ADMIN",
    label: "Super admin",
    access: "Full access to everything (catalog, orders, users, settings).",
  },
  {
    role: "ADMIN",
    label: "Admin",
    access: "Broad store admin access; not every super-admin setting.",
  },
  {
    role: "STORE_MANAGER",
    label: "Store manager",
    access: "Shopkeeper — take and fulfill orders day-to-day.",
  },
  {
    role: "SHOPPER",
    label: "Shopper",
    access: "Customer account; storefront buyer, no admin powers.",
  },
];

const MOCK_STAFF: AdminUser[] = [
  {
    id: "USR-1",
    name: "Mahfuz Rahman",
    email: "mahfuz.owner@example.com",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    createdAt: "2026-04-01T04:00:00.000Z",
  },
  {
    id: "USR-2",
    name: "Nadia Karim",
    email: "nadia.admin@example.com",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2026-04-15T05:30:00.000Z",
  },
  {
    id: "USR-3",
    name: "Kamrul Islam",
    email: "kamrul.store@example.com",
    role: "STORE_MANAGER",
    status: "ACTIVE",
    createdAt: "2026-05-02T06:15:00.000Z",
  },
  {
    id: "USR-4",
    name: "Sumaiya Haque",
    email: "sumaiya.store@example.com",
    role: "STORE_MANAGER",
    status: "INVITED",
    createdAt: "2026-09-28T09:00:00.000Z",
  },
  {
    id: "USR-5",
    name: "Rashed Mia",
    email: "rashed.store@example.com",
    role: "STORE_MANAGER",
    status: "DISABLED",
    createdAt: "2026-05-20T07:45:00.000Z",
  },
];

export const mockAdminUsers: AdminUser[] = [
  ...MOCK_STAFF,
  ...MOCK_CUSTOMER_PROFILES.map(
    (profile): AdminUser => ({
      id: profile.id.replace("CUS-", "USR-"),
      name: profile.name,
      email: profile.email,
      role: "SHOPPER",
      status: "ACTIVE",
      createdAt: profile.joinedAt,
    }),
  ),
];

export function listAdminUsers(): AdminUser[] {
  return [...mockAdminUsers].sort((a, b) => a.name.localeCompare(b.name));
}
