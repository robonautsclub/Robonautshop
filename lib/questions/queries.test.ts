import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/lib/db";
import { categories } from "@/lib/db/schema/categories";
import { products } from "@/lib/db/schema/products";
import { users } from "@/lib/db/schema/users";
import {
  answerQuestion,
  createQuestion,
  getPublicQuestionsForProduct,
  setQuestionHidden,
} from "@/lib/questions/queries";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  const now = new Date();
  await db.insert(users).values({
    id: "u1",
    name: "Rahim Uddin",
    email: "r@example.com",
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(categories).values({ id: "c1", name: "Parts", slug: "parts" });
  await db.insert(products).values({
    id: "p1",
    name: "N20 Motor",
    slug: "n20-motor",
    sku: "N20",
    description: "",
    shortDescription: "",
    categoryId: "c1",
    price: 300,
    status: "PUBLISHED",
  });
});

afterAll(async () => {
  await dispose();
});

describe("product questions", () => {
  it("keeps a question private until it is answered, and shows only the first name", async () => {
    const id = await createQuestion(db, { productId: "p1", userId: "u1", question: "Is it 6V or 12V?" });
    expect(await getPublicQuestionsForProduct(db, "p1")).toEqual([]);

    expect(await answerQuestion(db, id, "It is a 6V motor.")).toMatchObject({ ok: true, productSlug: "n20-motor" });
    const [visible] = await getPublicQuestionsForProduct(db, "p1");
    expect(visible).toMatchObject({ question: "Is it 6V or 12V?", answer: "It is a 6V motor.", askedBy: "Rahim" });
  });

  it("hides and restores an answered question", async () => {
    const [{ id }] = await getPublicQuestionsForProduct(db, "p1");
    await setQuestionHidden(db, id, true);
    expect(await getPublicQuestionsForProduct(db, "p1")).toEqual([]);
    await setQuestionHidden(db, id, false);
    expect(await getPublicQuestionsForProduct(db, "p1")).toHaveLength(1);
  });

  it("restores an unanswered hidden question to pending, not public", async () => {
    const id = await createQuestion(db, { productId: "p1", userId: "u1", question: "Does it ship with wheels?" });
    await setQuestionHidden(db, id, true);
    await setQuestionHidden(db, id, false);
    const publicIds = (await getPublicQuestionsForProduct(db, "p1")).map((q) => q.id);
    expect(publicIds).not.toContain(id);
  });

  it("reports unknown questions", async () => {
    expect(await answerQuestion(db, "missing", "x")).toMatchObject({ ok: false });
    expect(await setQuestionHidden(db, "missing", true)).toMatchObject({ ok: false });
  });
});
