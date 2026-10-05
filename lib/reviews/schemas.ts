import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number.")
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating can be at most 5."),
  title: z.string().trim().max(120, "Title is too long.").optional(),
  body: z
    .string()
    .trim()
    .min(10, "Review must be at least 10 characters.")
    .max(2000, "Review is too long."),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
