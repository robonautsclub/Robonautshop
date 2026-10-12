import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { products } from "@/lib/db/schema/products";
import { users } from "@/lib/db/schema/users";

export const QUESTION_STATUS_VALUES = ["PENDING", "ANSWERED", "HIDDEN"] as const;
export type QuestionStatus = (typeof QUESTION_STATUS_VALUES)[number];

/**
 * Customer questions about a product (task 140). Only ANSWERED questions are
 * public; PENDING waits for an admin and HIDDEN is moderated away. The
 * visibility rule lives in lib/questions/queries.ts.
 */
export const productQuestions = sqliteTable(
  "product_questions",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer"),
    status: text("status", { enum: QUESTION_STATUS_VALUES }).notNull().default("PENDING"),
    answeredAt: text("answered_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("product_questions_product_status_idx").on(table.productId, table.status),
    index("product_questions_status_idx").on(table.status),
    index("product_questions_user_id_idx").on(table.userId),
  ],
);
