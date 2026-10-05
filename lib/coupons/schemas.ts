import { z } from "zod";

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters.")
      .max(30, "Code is too long.")
      .regex(/^[a-zA-Z0-9-]+$/, "Letters, numbers, and hyphens only."),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number().int("Must be a whole number.").positive("Must be positive."),
    minSubtotal: z.coerce.number().int().min(0).optional(),
    maxUses: z.coerce.number().int().positive().optional(),
    active: z.boolean().default(true),
    expiresAt: z.string().optional(),
  })
  .refine((value) => value.type !== "PERCENT" || value.value <= 100, {
    message: "Percent discounts can't exceed 100.",
    path: ["value"],
  });

export type CouponInput = z.infer<typeof couponSchema>;
