import { z } from "zod";

import {
  ADMIN_STOCK_REASONS,
  PRODUCT_STATUS_VALUES,
  PROJECT_SKILL_LEVEL_VALUES,
} from "@/lib/db/schema/shared";

/**
 * Server-side validation for admin catalog writes
 * (tasks/phase-19-admin-catalog/119–125). The same schemas run in the
 * browser for instant feedback, but the server action always re-parses —
 * the client copy is a convenience, never the check.
 */

const slugField = z
  .string()
  .trim()
  .max(120, "Slug is too long.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.");

const optionalSlugField = z.union([z.literal(""), slugField]).optional();

const bdtAmount = z.coerce
  .number("Enter a number.")
  .int("Use whole taka.")
  .min(0, "Can't be negative.")
  .max(10_000_000, "Amount is too large.");

const optionalBdt = z
  .union([z.literal(""), z.null(), bdtAmount])
  .optional()
  .transform((value) => (value === "" || value === undefined ? null : value));

const nameField = z.string().trim().min(2, "Name must be at least 2 characters.").max(160, "Name is too long.");
const idField = z.string().trim().min(1);

/** An image reference: an absolute https URL or a site-relative path (R2 media route). */
const imageUrlField = z
  .string()
  .trim()
  .min(1, "Add an image URL.")
  .refine(
    (value) => value.startsWith("/") || /^https:\/\//.test(value),
    "Use an https:// URL or a /path on this site.",
  );

const skuField = z
  .string()
  .trim()
  .min(2, "SKU must be at least 2 characters.")
  .max(64, "SKU is too long.")
  .regex(/^[A-Za-z0-9-_]+$/, "SKU: letters, numbers, hyphens and underscores only.")
  .transform((value) => value.toUpperCase());

export const productVariantInputSchema = z.object({
  /** Present for existing variants; absent for new ones. */
  id: idField.optional(),
  name: z.string().trim().min(1, "Variant name is required.").max(80),
  sku: skuField,
  price: optionalBdt,
});

/**
 * "Key: Value" per line ↔ the specifications JSON map
 * (AGENTS.md "Product Data": flexible specs, not a column per spec).
 */
export function parseSpecificationLines(text: string): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key && value) specs[key] = value;
  }
  return specs;
}

export function formatSpecificationLines(specs: Record<string, string>): string {
  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

export const productInputSchema = z
  .object({
    name: nameField,
    slug: optionalSlugField,
    sku: skuField,
    brand: z.string().trim().max(80).optional().transform((value) => value || null),
    categoryId: idField.pipe(z.string().min(1, "Choose a category.")),
    price: bdtAmount.refine((value) => value > 0, "Price must be more than 0."),
    compareAtPrice: optionalBdt,
    weightGrams: optionalBdt,
    status: z.enum(PRODUCT_STATUS_VALUES),
    featured: z.boolean().default(false),
    shortDescription: z.string().trim().min(1, "Add a short description.").max(300),
    description: z.string().trim().min(1, "Add a description.").max(20_000),
    specifications: z.record(z.string().max(80), z.string().max(300)).default({}),
    variants: z.array(productVariantInputSchema).max(50).default([]),
  })
  .refine(
    (value) => value.compareAtPrice === null || value.compareAtPrice > value.price,
    { message: "Compare-at price must be higher than the price.", path: ["compareAtPrice"] },
  )
  .refine(
    (value) => new Set(value.variants.map((variant) => variant.sku)).size === value.variants.length,
    { message: "Each variant needs its own SKU.", path: ["variants"] },
  );

export type ProductInput = z.input<typeof productInputSchema>;
export type ProductData = z.output<typeof productInputSchema>;

export const productStatusInputSchema = z.object({
  productId: idField,
  status: z.enum(PRODUCT_STATUS_VALUES),
});

export const categoryInputSchema = z.object({
  name: nameField,
  slug: optionalSlugField,
  description: z.string().trim().max(1000).optional().transform((value) => value || null),
  sortOrder: z.coerce.number().int("Use a whole number.").min(0).max(10_000).default(0),
});

export type CategoryInput = z.input<typeof categoryInputSchema>;
export type CategoryData = z.output<typeof categoryInputSchema>;

export const bomLineInputSchema = z.object({
  productId: idField,
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1.").max(999),
  optional: z.boolean().default(false),
});

const bomField = z
  .array(bomLineInputSchema)
  .min(1, "Add at least one component.")
  .max(100)
  .refine(
    (lines) => new Set(lines.map((line) => line.productId)).size === lines.length,
    "Each product can only appear once.",
  );

export const kitInputSchema = z
  .object({
    name: nameField,
    slug: optionalSlugField,
    shortDescription: z.string().trim().min(1, "Add a short description.").max(300),
    description: z.string().trim().min(1, "Add a description.").max(20_000),
    price: bdtAmount.refine((value) => value > 0, "Price must be more than 0."),
    compareAtPrice: optionalBdt,
    status: z.enum(PRODUCT_STATUS_VALUES),
    featured: z.boolean().default(false),
    projectId: z.string().trim().optional().transform((value) => value || null),
    imageUrl: imageUrlField,
    imageAlt: z.string().trim().min(1, "Add image alt text.").max(200),
    components: bomField,
  })
  .refine(
    (value) => value.compareAtPrice === null || value.compareAtPrice > value.price,
    { message: "Compare-at price must be higher than the price.", path: ["compareAtPrice"] },
  );

export type KitInput = z.input<typeof kitInputSchema>;
export type KitData = z.output<typeof kitInputSchema>;

export const projectInputSchema = z.object({
  name: nameField,
  slug: optionalSlugField,
  shortDescription: z.string().trim().min(1, "Add a short description.").max(300),
  description: z.string().trim().min(1, "Add a description.").max(20_000),
  skillLevel: z.enum(PROJECT_SKILL_LEVEL_VALUES),
  status: z.enum(PRODUCT_STATUS_VALUES),
  featured: z.boolean().default(false),
  imageUrl: imageUrlField,
  imageAlt: z.string().trim().min(1, "Add image alt text.").max(200),
  components: bomField,
});

export type ProjectInput = z.input<typeof projectInputSchema>;
export type ProjectData = z.output<typeof projectInputSchema>;

export const stockAdjustmentInputSchema = z.object({
  inventoryId: idField,
  delta: z.coerce
    .number("Enter a number.")
    .int("Use whole units.")
    .refine((value) => value !== 0, "Change can't be 0.")
    .refine((value) => Math.abs(value) <= 100_000, "Change is too large."),
  reason: z.enum(ADMIN_STOCK_REASONS, "Choose a reason."),
  note: z.string().trim().max(300).optional().transform((value) => value || null),
});

export type StockAdjustmentInput = z.input<typeof stockAdjustmentInputSchema>;

export const lowStockThresholdInputSchema = z.object({
  inventoryId: idField,
  lowStockThreshold: z.coerce.number().int("Use whole units.").min(0).max(100_000),
});
