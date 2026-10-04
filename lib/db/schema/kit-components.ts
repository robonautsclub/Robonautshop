import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { kits } from "@/lib/db/schema/kits";
import { productVariants } from "@/lib/db/schema/product-variants";
import { products } from "@/lib/db/schema/products";

/**
 * Matches the `KitComponent` type in lib/catalog/types.ts — the join table
 * connecting a Kit to the Products sold inside it (AGENTS.md "Kit").
 *
 * Same FK reasoning as project_components: `productId` restricts deletion,
 * `variantId` falls back to the base product via `set null`.
 */
export const kitComponents = sqliteTable(
  "kit_components",
  {
    id: text("id").primaryKey(),
    kitId: text("kit_id")
      .notNull()
      .references(() => kits.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("kit_components_kit_id_idx").on(table.kitId),
    index("kit_components_product_id_idx").on(table.productId),
    uniqueIndex("kit_components_unique").on(
      table.kitId,
      table.productId,
      table.variantId,
    ),
  ],
);
