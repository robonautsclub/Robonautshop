export type PaymentMethodId = "BKASH";

export const PAYMENT_METHODS: Array<{
  id: PaymentMethodId;
  label: string;
  description: string;
}> = [
  {
    id: "BKASH",
    label: "bKash",
    description:
      "Pay with bKash Checkout. You will be redirected to bKash to complete payment.",
  },
];

export type ShippingEstimate = {
  method: string;
  amount: number;
  note: string;
};

/** Simple city-based delivery estimate. */
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
      note: "Delivery charge for Dhaka areas.",
    };
  }

  return {
    method: "Outside Dhaka delivery",
    amount: 130,
    note: "Delivery charge for outside Dhaka.",
  };
}
