import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { robotProjects } from "@/lib/db/schema/robot-projects";
import { PRODUCT_STATUS_VALUES } from "@/lib/db/schema/shared";

/**
 * Matches the `Kit` type in lib/catalog/types.ts.
 *
 * `projectId` is an optional link to the robot project this kit builds
 * (AGENTS.md "Kit"); `set null` so deleting that project doesn't delete the
 * kit itself, just the link.
 */
export const kits = sqliteTable(
  "kits",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    shortDescription: text("short_description").notNull(),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    status: text("status", { enum: PRODUCT_STATUS_VALUES })
      .notNull()
      .default("DRAFT"),
    projectId: text("project_id").references(() => robotProjects.id, {
      onDelete: "set null",
    }),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    imageUrl: text("image_url").notNull(),
    imageAlt: text("image_alt").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("kits_status_idx").on(table.status),
    index("kits_project_id_idx").on(table.projectId),
  ],
);
