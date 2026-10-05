/**
 * Static demo orders for the admin orders shell.
 * Not a real orders system — clearly fixture data only.
 */

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

export const mockAdminOrders: AdminOrder[] = [
  {
    id: "ADM-1001",
    placedAt: "2026-03-28T09:15:00.000Z",
    customerName: "Ayesha Rahman",
    customerEmail: "ayesha@example.com",
    city: "Dhaka",
    orderStatus: "PROCESSING",
    paymentStatus: "PAID",
    paymentMethod: "bKash",
    subtotal: 2450,
    deliveryCharge: 80,
    total: 2530,
    lines: [
      {
        name: "Arduino Nano Compatible",
        quantity: 2,
        unitPrice: 450,
        lineTotal: 900,
      },
      {
        name: "N20 Metal Gear Motor 200RPM",
        quantity: 2,
        unitPrice: 180,
        lineTotal: 360,
      },
      {
        name: "L298N Motor Driver",
        quantity: 1,
        unitPrice: 1190,
        lineTotal: 1190,
      },
    ],
    specialInstructions: "Call before delivery.",
  },
  {
    id: "ADM-1002",
    placedAt: "2026-03-27T14:40:00.000Z",
    customerName: "Rafiul Islam",
    customerEmail: "rafiul@example.com",
    city: "Chattogram",
    orderStatus: "SHIPPED",
    paymentStatus: "PAID",
    paymentMethod: "Cash on Delivery",
    subtotal: 3890,
    deliveryCharge: 130,
    total: 4020,
    lines: [
      {
        name: "LFR Starter Kit",
        quantity: 1,
        unitPrice: 3890,
        lineTotal: 3890,
      },
    ],
  },
  {
    id: "ADM-1003",
    placedAt: "2026-03-26T11:05:00.000Z",
    customerName: "Nusrat Jahan",
    customerEmail: "nusrat@example.com",
    city: "Dhaka",
    orderStatus: "PENDING",
    paymentStatus: "PENDING",
    paymentMethod: "Nagad",
    subtotal: 720,
    deliveryCharge: 80,
    total: 800,
    lines: [
      {
        name: "HC-SR04 Ultrasonic Sensor",
        quantity: 3,
        unitPrice: 120,
        lineTotal: 360,
      },
      {
        name: "Jumper Wire Pack (M-M)",
        quantity: 2,
        unitPrice: 180,
        lineTotal: 360,
      },
    ],
  },
  {
    id: "ADM-1004",
    placedAt: "2026-03-24T18:20:00.000Z",
    customerName: "Tanvir Hasan",
    customerEmail: "tanvir@example.com",
    city: "Rajshahi",
    orderStatus: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "Cash on Delivery",
    subtotal: 1550,
    deliveryCharge: 130,
    total: 1680,
    lines: [
      {
        name: "ESP32 Dev Board",
        quantity: 1,
        unitPrice: 650,
        lineTotal: 650,
      },
      {
        name: "18650 Battery Holder 2S",
        quantity: 2,
        unitPrice: 450,
        lineTotal: 900,
      },
    ],
  },
  {
    id: "ADM-1005",
    placedAt: "2026-03-22T08:55:00.000Z",
    customerName: "Sabbir Ahmed",
    customerEmail: "sabbir@example.com",
    city: "Dhaka",
    orderStatus: "CANCELLED",
    paymentStatus: "REFUNDED",
    paymentMethod: "bKash",
    subtotal: 990,
    deliveryCharge: 80,
    total: 1070,
    lines: [
      {
        name: "TB6612FNG Motor Driver",
        quantity: 1,
        unitPrice: 990,
        lineTotal: 990,
      },
    ],
  },
];

export function listAdminOrders(): AdminOrder[] {
  return [...mockAdminOrders].sort(
    (a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt),
  );
}

export function getAdminOrderById(id: string): AdminOrder | null {
  return mockAdminOrders.find((order) => order.id === id) ?? null;
}
