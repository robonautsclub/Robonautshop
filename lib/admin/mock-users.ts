/**
 * Static demo users for the admin Users shell.
 */

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

export const mockAdminUsers: AdminUser[] = [
  {
    id: "USR-1",
    name: "Fuad Super",
    email: "super@robonautshop.local",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "USR-2",
    name: "Nadia Admin",
    email: "admin@robonautshop.local",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "USR-3",
    name: "Karim Manager",
    email: "manager@robonautshop.local",
    role: "STORE_MANAGER",
    status: "ACTIVE",
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "USR-4",
    name: "Ayesha Rahman",
    email: "ayesha@example.com",
    role: "SHOPPER",
    status: "ACTIVE",
    createdAt: "2026-02-12T00:00:00.000Z",
  },
  {
    id: "USR-5",
    name: "Rafiul Islam",
    email: "rafiul@example.com",
    role: "SHOPPER",
    status: "INVITED",
    createdAt: "2026-03-01T00:00:00.000Z",
  },
];

export function listAdminUsers(): AdminUser[] {
  return [...mockAdminUsers].sort((a, b) => a.name.localeCompare(b.name));
}
