import type { BatchItem } from "drizzle-orm/batch";

import type { Database } from "@/lib/db";

export type BatchStatement = BatchItem<"sqlite">;

/**
 * Runs statements as one atomic D1 batch (D1 has no interactive
 * transactions). No-op for an empty list — db.batch() requires at least one.
 */
export async function runBatch(db: Database, statements: BatchStatement[]): Promise<void> {
  if (statements.length === 0) return;
  await db.batch(statements as [BatchStatement, ...BatchStatement[]]);
}
