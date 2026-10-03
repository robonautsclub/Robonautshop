/**
 * Static demo customers for the admin customers shell.
 * Not real user records — fixture data only.
 */

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  orderCount: number;
  createdAt: string;
};

export const mockAdminCustomers: AdminCustomer[] = [
  {
    id: "CUS-2001",
    name: "Ayesha Rahman",
    email: "ayesha@example.com",
    phone: "01711000001",
    city: "Dhaka",
    orderCount: 4,
    createdAt: "2026-01-12T10:00:00.000Z",
  },
  {
    id: "CUS-2002",
    name: "Rafiul Islam",
    email: "rafiul@example.com",
    phone: "01812000002",
    city: "Chattogram",
    orderCount: 2,
    createdAt: "2026-02-03T08:30:00.000Z",
  },
  {
    id: "CUS-2003",
    name: "Nusrat Jahan",
    email: "nusrat@example.com",
    phone: "01913000003",
    city: "Dhaka",
    orderCount: 1,
    createdAt: "2026-02-18T15:45:00.000Z",
  },
  {
    id: "CUS-2004",
    name: "Tanvir Hasan",
    email: "tanvir@example.com",
    phone: "01614000004",
    city: "Rajshahi",
    orderCount: 3,
    createdAt: "2026-03-01T12:10:00.000Z",
  },
  {
    id: "CUS-2005",
    name: "Sabbir Ahmed",
    email: "sabbir@example.com",
    phone: "01515000005",
    city: "Dhaka",
    orderCount: 1,
    createdAt: "2026-03-10T09:20:00.000Z",
  },
  {
    id: "CUS-2006",
    name: "Farhana Akter",
    email: "farhana@example.com",
    phone: "01316000006",
    city: "Khulna",
    orderCount: 0,
    createdAt: "2026-03-20T11:00:00.000Z",
  },
];

export function listAdminCustomers(): AdminCustomer[] {
  return [...mockAdminCustomers].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}
