"use server";

import { revalidatePath } from "next/cache";

import { getProductBySlug } from "@/lib/catalog/queries";
import { getServerSession, requireAdminSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { limitAction } from "@/lib/rate-limit/action";
import { answerQuestionSchema, askQuestionSchema } from "@/lib/questions/schemas";
import {
  answerQuestion,
  createQuestion,
  setQuestionHidden,
  type QuestionWriteResult,
} from "@/lib/questions/queries";

export type AskQuestionResult = { ok: true } | { ok: false; error: string };

/** Signed-in customers only; the question stays private until an admin answers it. */
export async function askQuestionAction(
  productSlug: string,
  input: unknown,
): Promise<AskQuestionResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, error: "You must be signed in to ask a question." };
  }

  const limited = await limitAction("ask-question", { limit: 5, windowMs: 10 * 60 * 1000 }, session.user.id);
  if (limited) {
    return { ok: false, error: limited };
  }

  const parsed = askQuestionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid question." };
  }

  const db = await getRequestDb();
  const product = await getProductBySlug(db, productSlug);
  if (!product) {
    return { ok: false, error: "Product not found." };
  }

  await createQuestion(db, {
    productId: product.id,
    userId: session.user.id,
    question: parsed.data.question,
  });
  return { ok: true };
}

function revalidateAfterWrite(result: QuestionWriteResult) {
  revalidatePath("/admin/questions");
  if (result.ok && result.productSlug) {
    revalidatePath(`/products/${result.productSlug}`);
  }
}

export async function answerQuestionAction(
  questionId: string,
  answer: string,
): Promise<QuestionWriteResult> {
  await requireAdminSession();
  const parsed = answerQuestionSchema.safeParse({ answer });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid answer." };
  }
  const db = await getRequestDb();
  const result = await answerQuestion(db, questionId, parsed.data.answer);
  revalidateAfterWrite(result);
  return result;
}

export async function setQuestionHiddenAction(
  questionId: string,
  hidden: boolean,
): Promise<QuestionWriteResult> {
  await requireAdminSession();
  const db = await getRequestDb();
  const result = await setQuestionHidden(db, questionId, hidden);
  revalidateAfterWrite(result);
  return result;
}
