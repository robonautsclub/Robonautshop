import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

/** Matches the `Category` type in lib/catalog/types.ts. */
export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    /** One nesting level only (task 138): a parent must itself have no parent. Enforced in lib/admin/catalog-mutations.ts. */
    parentId: text("parent_id").references(
      (): AnySQLiteColumn => categories.id,
      {
        onDelete: "restrict",
      },
    ),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [index("categories_parent_id_idx").on(table.parentId)],
);
