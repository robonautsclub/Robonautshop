import { NextResponse } from "next/server";

import { contactFormSchema } from "@/lib/contact/schema";
import { escapeHtml } from "@/lib/email/html";
import { sendSesEmail } from "@/lib/email/ses";
import { checkRateLimit } from "@/lib/rate-limit/memory";

// OpenNext/Cloudflare only supports the Node.js runtime (there is no Edge
// runtime here) — declared explicitly since the AWS SDK needs Node APIs
// (via the `nodejs_compat` compatibility flag in wrangler.jsonc).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

function safeJsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const rateLimit = checkRateLimit(`contact:${ip}`, RATE_LIMIT);
  if (!rateLimit.allowed) {
    return safeJsonError("Too many requests. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return safeJsonError("Invalid request body.", 400);
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") {
        fieldErrors[key] = issue.message;
      }
    }
    return NextResponse.json({ ok: false, error: "Invalid input.", fieldErrors }, { status: 400 });
  }

  const { name, email, message, company } = parsed.data;

  // Honeypot tripped — pretend success so bots don't learn to leave it blank.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  const toEmail = process.env.CONTACT_FORM_TO_EMAIL?.trim();
  if (!toEmail) {
    console.error("[contact] CONTACT_FORM_TO_EMAIL is not configured — message dropped.");
    return safeJsonError("Something went wrong. Please try again.", 500);
  }

  try {
    await sendSesEmail({
      to: toEmail,
      replyTo: email,
      subject: `Contact form: ${name}`,
      html: `
        <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      `,
    });
  } catch (error) {
    console.error("[contact] SES send failed:", error);
    return safeJsonError("Something went wrong. Please try again.", 500);
  }

  return NextResponse.json({ ok: true });
}
