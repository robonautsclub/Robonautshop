import { z } from "zod";

export const askQuestionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(10, "Question must be at least 10 characters.")
    .max(500, "Question is too long."),
});

export const answerQuestionSchema = z.object({
  answer: z
    .string()
    .trim()
    .min(1, "Write an answer first.")
    .max(2000, "Answer is too long."),
});

export type AskQuestionInput = z.infer<typeof askQuestionSchema>;
