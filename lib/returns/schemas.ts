import { z } from "zod";

import { RETURN_REASON_VALUES, RETURN_TYPE_VALUES } from "@/lib/db/schema/return-requests";

export const returnRequestSchema = z.object({
  orderItemId: z.string().trim().min(1, "Choose an item."),
  type: z.enum(RETURN_TYPE_VALUES, "Choose return or warranty."),
  reason: z.enum(RETURN_REASON_VALUES, "Choose a reason."),
  quantity: z.coerce.number().int("Use a whole number.").min(1, "Quantity must be at least 1.").max(999),
  note: z
    .string()
    .trim()
    .max(1000, "Note is too long.")
    .optional()
    .transform((value) => value || null),
});

export const returnDecisionSchema = z.object({
  requestId: z.string().trim().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  adminNote: z
    .string()
    .trim()
    .max(1000, "Note is too long.")
    .optional()
    .transform((value) => value || null),
});

export type ReturnRequestInput = z.input<typeof returnRequestSchema>;
