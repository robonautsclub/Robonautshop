import type { Database } from "@/lib/db";
import { bkashFetchJson, BkashApiError } from "@/lib/payments/bkash/client";
import { getBkashCallbackUrl } from "@/lib/payments/bkash/config";
import { getValidBkashIdToken } from "@/lib/payments/bkash/token";

export type CreateBkashPaymentInput = {
  /** Server-computed order total in whole BDT. */
  amountBdt: number;
  /** Our order id — used as merchantInvoiceNumber. */
  orderId: string;
  /** Shipping phone — pre-fills wallet entry when possible. */
  payerReference: string;
};

export type CreateBkashPaymentResult = {
  paymentID: string;
  bkashURL: string;
};

type CreatePaymentResponse = {
  paymentID?: string;
  bkashURL?: string;
  statusCode?: string;
  statusMessage?: string;
};

/**
 * Create a Checkout (URL) payment (`mode: "0011"`) and return the URL to
 * redirect the customer to.
 */
export async function createBkashCheckoutPayment(
  db: Database,
  input: CreateBkashPaymentInput,
): Promise<CreateBkashPaymentResult> {
  const idToken = await getValidBkashIdToken(db);
  const callbackURL = getBkashCallbackUrl();

  const data = await bkashFetchJson<CreatePaymentResponse>({
    path: "/tokenized/checkout/create",
    idToken,
    body: {
      mode: "0011",
      payerReference: input.payerReference,
      callbackURL,
      amount: String(input.amountBdt),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: input.orderId,
    },
  });

  if (data.statusCode && data.statusCode !== "0000") {
    throw new BkashApiError(
      data.statusMessage ?? "bKash create payment failed.",
      data.statusCode,
      data.statusMessage,
    );
  }

  if (!data.paymentID || !data.bkashURL) {
    throw new BkashApiError(
      data.statusMessage ?? "bKash create payment did not return paymentID/bkashURL.",
      data.statusCode,
      data.statusMessage,
    );
  }

  return { paymentID: data.paymentID, bkashURL: data.bkashURL };
}
