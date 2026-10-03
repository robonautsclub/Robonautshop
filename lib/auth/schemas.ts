import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(80, "Name is too long."),
    email: z.email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password is too long."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name is too long."),
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladesh mobile number."),
  addressLine1: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters.")
    .max(120, "Street address is too long."),
  addressLine2: z.string().trim().max(120, "Address line is too long.").optional(),
  city: z
    .string()
    .trim()
    .min(2, "City / district is required.")
    .max(80, "City / district is too long."),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Enter a 4-digit postal code.")
    .optional()
    .or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
