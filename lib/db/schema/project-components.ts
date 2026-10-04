import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { productVariants } from "@/lib/db/schema/product-variants";
import { products } from "@/lib/db/schema/products";
import { robotProjects } from "@/lib/db/schema/robot-projects";

/**
 * Matches the `ProjectComponent` type in lib/catalog/types.ts — the join
 * table connecting a Robot Project to the actual Products that build it
 * (AGENTS.md "Project Component").
 *
 * `productId` uses `restrict` so a product referenced by a project's BOM
 * can't be deleted out from under it; `variantId` uses `set null` since a
 * missing variant can gracefully fall back to the base product.
 */
export const projectComponents = sqliteTable(
  "project_components",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => robotProjects.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").notNull().default(1),
    optional: integer("optional", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("project_components_project_id_idx").on(table.projectId),
    index("project_components_product_id_idx").on(table.productId),
    uniqueIndex("project_components_unique").on(
      table.projectId,
      table.productId,
      table.variantId,
    ),
  ],
);
