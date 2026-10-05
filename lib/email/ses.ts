import "server-only";

import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

let client: SESv2Client | null = null;

/** Lazily-built, reused SESv2 client — avoids constructing (and reading env) at module load. */
function getSesClient(): SESv2Client {
  if (!client) {
    const region = process.env.SES_REGION?.trim();
    const accessKeyId = process.env.SES_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.SES_SECRET_ACCESS_KEY?.trim();
    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "SES is not configured. Set SES_REGION, SES_ACCESS_KEY_ID, and SES_SECRET_ACCESS_KEY.",
      );
    }
    client = new SESv2Client({ region, credentials: { accessKeyId, secretAccessKey } });
  }
  return client;
}

export type SendSesEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

/** True when the SES env vars needed to send are present. */
export function isSesConfigured(): boolean {
  return Boolean(
    process.env.SES_REGION?.trim() &&
      process.env.SES_ACCESS_KEY_ID?.trim() &&
      process.env.SES_SECRET_ACCESS_KEY?.trim() &&
      process.env.SES_FROM_EMAIL?.trim(),
  );
}

/** Verified SES sender — uses `SES_FROM_EMAIL` with a Robonautshop display name. */
export function getSesFromAddress(): string {
  const from = process.env.SES_FROM_EMAIL?.trim();
  if (!from) {
    throw new Error("SES_FROM_EMAIL is not configured.");
  }
  if (from.includes("<")) {
    return from;
  }
  return `Robonautshop <${from}>`;
}

/**
 * Send a single transactional email via Amazon SES (SESv2).
 * Server-only — do not import from Client Components.
 *
 * Throws on misconfiguration or SES failure; callers are responsible for
 * catching, logging the real error server-side, and returning a safe
 * message to the client (see app/api/contact/route.ts).
 */
export async function sendSesEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendSesEmailInput): Promise<string | undefined> {
  const command = new SendEmailCommand({
    FromEmailAddress: getSesFromAddress(),
    Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
    ReplyToAddresses: replyTo ? [replyTo] : undefined,
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: html, Charset: "UTF-8" },
          Text: {
            Data: text ?? html.replace(/<[^>]+>/g, ""),
            Charset: "UTF-8",
          },
        },
      },
    },
  });

  const result = await getSesClient().send(command);
  return result.MessageId;
}
