/**
 * D1/SQLite reports unique-index violations as "UNIQUE constraint failed:
 * <table>.<column>". Drizzle wraps the driver error, so check the cause chain.
 * Returns the offending column (e.g. "slug") or null when it isn't one.
 */
export function getUniqueConstraintColumn(error: unknown): string | null {
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    const message = current instanceof Error ? current.message : String(current);
    const match = /UNIQUE constraint failed: \w+\.(\w+)/.exec(message);
    if (match) {
      return match[1];
    }
    current = current instanceof Error ? current.cause : null;
  }
  return null;
}

/** Same idea for FOREIGN KEY violations (e.g. deleting a row still referenced). */
export function isForeignKeyError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    const message = current instanceof Error ? current.message : String(current);
    if (message.includes("FOREIGN KEY constraint failed")) {
      return true;
    }
    current = current instanceof Error ? current.cause : null;
  }
  return false;
}
