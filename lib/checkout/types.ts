export type PaymentMethodId = "COD" | "BKASH" | "NAGAD";

export const PAYMENT_METHODS: Array<{
  id: PaymentMethodId;
  label: string;
  description: string;
}> = [
  {
    id: "COD",
    label: "Cash on Delivery",
    description: "Pay when your order arrives. No online charge in this demo.",
  },
  {
    id: "BKASH",
    label: "bKash",
    description: "Placeholder only — no bKash payment is processed.",
  },
  {
    id: "NAGAD",
    label: "Nagad",
    description: "Placeholder only — no Nagad payment is processed.",
  },
];

export type ShippingEstimate = {
  method: string;
  amount: number;
  note: string;
};

/** Simple mock estimate. Not a courier API. */
export function estimateShippingBdt(city: string): ShippingEstimate {
  const normalized = city.trim().toLowerCase();

  if (!normalized) {
    return {
      method: "Standard delivery",
      amount: 0,
      note: "Enter a city to see the delivery charge.",
    };
  }

  if (
    normalized.includes("dhaka") ||
    normalized.includes("ঢাকা") ||
    normalized === "dhanmondi" ||
    normalized === "gulshan" ||
    normalized === "uttara" ||
    normalized === "mirpur"
  ) {
    return {
      method: "Dhaka metro delivery",
      amount: 80,
      note: "Mock delivery charge for Dhaka areas. Not a live courier quote.",
    };
  }

  return {
    method: "Outside Dhaka delivery",
    amount: 130,
    note: "Mock delivery charge for outside Dhaka. Not a live courier quote.",
  };
}

export type DemoOrderLine = {
  key: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type DemoOrderSnapshot = {
  demoOrderId: string;
  placedAt: string;
  address: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  shipping: ShippingEstimate;
  paymentMethod: PaymentMethodId;
  specialInstructions?: string;
  lines: DemoOrderLine[];
  subtotal: number;
  total: number;
};

export const DEMO_ORDER_STORAGE_KEY = "robonautshop.demo-order.v1";
