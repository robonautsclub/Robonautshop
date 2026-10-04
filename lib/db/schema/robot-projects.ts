import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import {
  PRODUCT_STATUS_VALUES,
  PROJECT_SKILL_LEVEL_VALUES,
} from "@/lib/db/schema/shared";

/** Matches the `RobotProject` type in lib/catalog/types.ts. */
export const robotProjects = sqliteTable(
  "robot_projects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    shortDescription: text("short_description").notNull(),
    skillLevel: text("skill_level", { enum: PROJECT_SKILL_LEVEL_VALUES }).notNull(),
    status: text("status", { enum: PRODUCT_STATUS_VALUES })
      .notNull()
      .default("DRAFT"),
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
  (table) => [index("robot_projects_status_idx").on(table.status)],
);
