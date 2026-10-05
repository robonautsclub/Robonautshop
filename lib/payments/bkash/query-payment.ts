import type { Database } from "@/lib/db";
import { bkashFetchJson, BkashApiError } from "@/lib/payments/bkash/client";
import { getValidBkashIdToken } from "@/lib/payments/bkash/token";

export type QueryBkashPaymentResult = {
  paymentID: string;
  transactionStatus: string;
  trxID?: string;
  amount?: string;
  merchantInvoiceNumber?: string;
};

type QueryPaymentResponse = {
  paymentID?: string;
  trxID?: string;
  transactionStatus?: string;
  amount?: string;
  merchantInvoiceNumber?: string;
  statusCode?: string;
  statusMessage?: string;
};

/**
 * Query payment status when Execute returns nothing useful (per bKash docs).
 */
export async function queryBkashPayment(
  db: Database,
  paymentID: string,
): Promise<QueryBkashPaymentResult> {
  const idToken = await getValidBkashIdToken(db);

  const data = await bkashFetchJson<QueryPaymentResponse>({
    path: "/tokenized/checkout/payment/status",
    idToken,
    body: { paymentID },
  });

  if (data.statusCode && data.statusCode !== "0000") {
    throw new BkashApiError(
      data.statusMessage ?? "bKash query payment failed.",
      data.statusCode,
      data.statusMessage,
    );
  }

  if (!data.paymentID || !data.transactionStatus) {
    throw new BkashApiError(
      data.statusMessage ?? "bKash query payment returned an incomplete response.",
      data.statusCode,
      data.statusMessage,
    );
  }

  return {
    paymentID: data.paymentID,
    transactionStatus: data.transactionStatus,
    trxID: data.trxID,
    amount: data.amount,
    merchantInvoiceNumber: data.merchantInvoiceNumber,
  };
}
