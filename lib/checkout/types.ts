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
    description: "Pay with bKash Checkout. You will be redirected to bKash to complete payment.",
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

