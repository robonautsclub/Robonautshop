"use server";

import { revalidatePath } from "next/cache";

import { getServerSession, requireAdminSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { limitAction } from "@/lib/rate-limit/action";
import {
  createReturnRequest,
  decideReturnRequest,
  type CreateReturnResult,
  type DecideReturnResult,
} from "@/lib/returns/queries";
import { returnDecisionSchema, returnRequestSchema } from "@/lib/returns/schemas";

export async function requestReturnAction(input: unknown): Promise<CreateReturnResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, error: "You must be signed in to make a request." };
  }

  const limited = await limitAction("return-request", { limit: 5, windowMs: 10 * 60 * 1000 }, session.user.id);
  if (limited) {
    return { ok: false, error: limited };
  }

  const parsed = returnRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const db = await getRequestDb();
  const result = await createReturnRequest(db, session.user.id, parsed.data);
  if (result.ok) {
    revalidatePath("/account/orders");
    revalidatePath("/admin/returns");
  }
  return result;
}

/** Admin-only decision. */
export async function decideReturnAction(input: unknown): Promise<DecideReturnResult> {
  const session = await requireAdminSession();
  const parsed = returnDecisionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid decision." };
  }

  const db = await getRequestDb();
  const result = await decideReturnRequest(
    db,
    parsed.data.requestId,
    parsed.data.decision,
    parsed.data.adminNote,
    session.user.id,
  );
  if (result.ok) {
    revalidatePath("/admin/returns");
    revalidatePath("/admin/inventory");
    revalidatePath("/account/orders");
  }
  return result;
}
