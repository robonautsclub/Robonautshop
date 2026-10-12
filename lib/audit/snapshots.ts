import { eq } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { kits } from "@/lib/db/schema/kits";
import { orders } from "@/lib/db/schema/orders";
import { products } from "@/lib/db/schema/products";
import { robotProjects } from "@/lib/db/schema/robot-projects";

/** Small "before" snapshots for audit entries — only the fields worth showing. */

export async function productSnapshot(db: Database, id: string) {
  const row = (
    await db
      .select({
        name: products.name,
        sku: products.sku,
        price: products.price,
        status: products.status,
        categoryId: products.categoryId,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
  )[0];
  return row ?? null;
}

export async function orderStatusSnapshot(db: Database, id: string) {
  const row = (
    await db
      .select({ status: orders.status, paymentStatus: orders.paymentStatus })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)
  )[0];
  return row ?? null;
}

export async function catalogStatusSnapshot(
  db: Database,
  table: "products" | "kits" | "robot_projects",
  id: string,
) {
  const target = table === "products" ? products : table === "kits" ? kits : robotProjects;
  const row = (
    await db.select({ status: target.status }).from(target).where(eq(target.id, id)).limit(1)
  )[0];
  return row ?? null;
}
