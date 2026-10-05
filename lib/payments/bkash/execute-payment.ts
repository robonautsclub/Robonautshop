import type { Database } from "@/lib/db";
import { bkashFetchJson, BkashApiError } from "@/lib/payments/bkash/client";
import { getValidBkashIdToken } from "@/lib/payments/bkash/token";

export type ExecuteBkashPaymentResult = {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount?: string;
  merchantInvoiceNumber?: string;
};

type ExecutePaymentResponse = {
  paymentID?: string;
  trxID?: string;
  transactionStatus?: string;
  amount?: string;
  merchantInvoiceNumber?: string;
  statusCode?: string;
  statusMessage?: string;
};

/**
 * Finalize a Checkout (URL) payment after bKash redirects back with success.
 * Never mark an order paid without a successful execute (or query) response.
 */
export async function executeBkashPayment(
  db: Database,
  paymentID: string,
): Promise<ExecuteBkashPaymentResult> {
  const idToken = await getValidBkashIdToken(db);

  const data = await bkashFetchJson<ExecutePaymentResponse>({
    path: "/tokenized/checkout/execute",
    idToken,
    body: { paymentID },
  });

  if (data.statusCode && data.statusCode !== "0000") {
    throw new BkashApiError(
      data.statusMessage ?? "bKash execute payment failed.",
      data.statusCode,
      data.statusMessage,
    );
  }

  if (!data.paymentID || !data.trxID) {
    throw new BkashApiError(
      data.statusMessage ?? "bKash execute payment did not return paymentID/trxID.",
      data.statusCode,
      data.statusMessage,
    );
  }

  if (data.transactionStatus && data.transactionStatus !== "Completed") {
    throw new BkashApiError(
      `bKash payment status is ${data.transactionStatus}, not Completed.`,
      data.statusCode,
      data.statusMessage,
    );
  }

  return {
    paymentID: data.paymentID,
    trxID: data.trxID,
    transactionStatus: data.transactionStatus ?? "Completed",
    amount: data.amount,
    merchantInvoiceNumber: data.merchantInvoiceNumber,
  };
}
