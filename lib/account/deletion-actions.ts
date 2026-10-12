"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { deleteCustomerAccount } from "@/lib/account/deletion";
import { getAuth } from "@/lib/auth/server";
import { getServerSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { accounts } from "@/lib/db/schema/users";
import { limitAction } from "@/lib/rate-limit/action";
import { loggerForAction } from "@/lib/logger-next";

const deleteAccountSchema = z.object({
  /** Password for email/password accounts; the account email for social-only accounts. */
  confirmation: z.string().min(1, "Confirm to delete your account.").max(256),
});

const DELETE_ACCOUNT_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

export type DeleteMyAccountResult = { ok: true } | { ok: false; error: string };

/**
 * Re-authenticates (password, or typing the email for social-only accounts),
 * then anonymizes the account — see lib/account/deletion.ts for exactly what
 * is kept. Only ever acts on the session user.
 */
export async function deleteMyAccountAction(confirmation: string): Promise<DeleteMyAccountResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, error: "You must be signed in to delete your account." };
  }

  const parsed = deleteAccountSchema.safeParse({ confirmation });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid confirmation." };
  }

  const limited = await limitAction("delete-account", DELETE_ACCOUNT_LIMIT, session.user.id);
  if (limited) {
    return { ok: false, error: limited };
  }

  const db = await getRequestDb();
  const credential = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.userId, session.user.id), eq(accounts.providerId, "credential")))
    .limit(1);

  if (credential.length > 0) {
    try {
      const auth = await getAuth();
      await auth.api.verifyPassword({
        body: { password: parsed.data.confirmation },
        headers: await headers(),
      });
    } catch (error) {
      (await loggerForAction()).warn("account.delete_confirmation_rejected", { userId: session.user.id, reason: error instanceof Error ? error.message : "unknown" });
      return { ok: false, error: "That password is incorrect." };
    }
  } else if (parsed.data.confirmation.trim().toLowerCase() !== session.user.email.toLowerCase()) {
    return { ok: false, error: "Type your account email address to confirm." };
  }

  try {
    return await deleteCustomerAccount(db, session.user.id);
  } catch (error) {
    (await loggerForAction()).error("account.deletion_failed", error, { userId: session.user.id });
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
