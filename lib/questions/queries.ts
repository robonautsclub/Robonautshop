import { and, desc, eq } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { productQuestions, type QuestionStatus } from "@/lib/db/schema/product-questions";
import { products } from "@/lib/db/schema/products";
import { users } from "@/lib/db/schema/users";

export type PublicQuestion = {
  id: string;
  question: string;
  answer: string;
  askedBy: string;
  createdAt: string;
  answeredAt: string | null;
};

export type AdminQuestion = {
  id: string;
  productName: string;
  productSlug: string;
  askedBy: string;
  question: string;
  answer: string | null;
  status: QuestionStatus;
  createdAt: string;
};

/** First name only — never expose a customer's full name or email publicly. */
function publicName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "Customer";
}

/** The one visibility rule: only ANSWERED questions with an answer are public. */
export async function getPublicQuestionsForProduct(
  db: Database,
  productId: string,
): Promise<PublicQuestion[]> {
  const rows = await db
    .select({
      id: productQuestions.id,
      question: productQuestions.question,
      answer: productQuestions.answer,
      createdAt: productQuestions.createdAt,
      answeredAt: productQuestions.answeredAt,
      authorName: users.name,
    })
    .from(productQuestions)
    .innerJoin(users, eq(users.id, productQuestions.userId))
    .where(and(eq(productQuestions.productId, productId), eq(productQuestions.status, "ANSWERED")))
    .orderBy(desc(productQuestions.answeredAt));

  // ANSWERED always has an answer; the check keeps the type honest.
  return rows.flatMap((row) =>
    row.answer
      ? [
          {
            id: row.id,
            question: row.question,
            answer: row.answer,
            askedBy: publicName(row.authorName),
            createdAt: row.createdAt,
            answeredAt: row.answeredAt,
          },
        ]
      : [],
  );
}

export async function createQuestion(
  db: Database,
  input: { productId: string; userId: string; question: string },
): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(productQuestions).values({ id, ...input });
  return id;
}

export async function listQuestionsForAdmin(db: Database): Promise<AdminQuestion[]> {
  return db
    .select({
      id: productQuestions.id,
      productName: products.name,
      productSlug: products.slug,
      askedBy: users.name,
      question: productQuestions.question,
      answer: productQuestions.answer,
      status: productQuestions.status,
      createdAt: productQuestions.createdAt,
    })
    .from(productQuestions)
    .innerJoin(products, eq(products.id, productQuestions.productId))
    .innerJoin(users, eq(users.id, productQuestions.userId))
    .orderBy(desc(productQuestions.createdAt));
}

export type QuestionWriteResult = { ok: true; productSlug: string } | { ok: false; error: string };

async function productSlugFor(db: Database, questionId: string): Promise<string | null> {
  const rows = await db
    .select({ slug: products.slug })
    .from(productQuestions)
    .innerJoin(products, eq(products.id, productQuestions.productId))
    .where(eq(productQuestions.id, questionId))
    .limit(1);
  return rows[0]?.slug ?? null;
}

/** Saves an answer and makes the question public. */
export async function answerQuestion(
  db: Database,
  questionId: string,
  answer: string,
): Promise<QuestionWriteResult> {
  const now = new Date().toISOString();
  const updated = await db
    .update(productQuestions)
    .set({ answer, status: "ANSWERED", answeredAt: now, updatedAt: now })
    .where(eq(productQuestions.id, questionId))
    .returning({ id: productQuestions.id });
  if (!updated[0]) {
    return { ok: false, error: "Question not found." };
  }
  return { ok: true, productSlug: (await productSlugFor(db, questionId)) ?? "" };
}

/** Hides a question, or restores it to ANSWERED / PENDING depending on whether it has an answer. */
export async function setQuestionHidden(
  db: Database,
  questionId: string,
  hidden: boolean,
): Promise<QuestionWriteResult> {
  const rows = await db
    .select({ answer: productQuestions.answer })
    .from(productQuestions)
    .where(eq(productQuestions.id, questionId))
    .limit(1);
  if (!rows[0]) {
    return { ok: false, error: "Question not found." };
  }

  const status: QuestionStatus = hidden ? "HIDDEN" : rows[0].answer ? "ANSWERED" : "PENDING";
  await db
    .update(productQuestions)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(productQuestions.id, questionId));
  return { ok: true, productSlug: (await productSlugFor(db, questionId)) ?? "" };
}
