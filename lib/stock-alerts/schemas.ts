import { z } from "zod";

export const backInStockSchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
  email: z
    .email("Enter a valid email address.")
    .max(254)
    .transform((value) => value.trim().toLowerCase()),
});

export type BackInStockInput = z.input<typeof backInStockSchema>;
