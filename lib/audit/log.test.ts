import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { listAuditLogs, recordAudit, sanitizeAuditData } from "@/lib/audit/log";
import type { Database } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  const now = new Date();
  await db.insert(users).values({ id: "a1", name: "Admin", email: "a@example.com", role: "ADMIN", createdAt: now, updatedAt: now });
});

afterAll(async () => {
  await dispose();
});

describe("sanitizeAuditData", () => {
  it("redacts secret-looking keys and trims long text", () => {
    const json = JSON.parse(
      sanitizeAuditData({ name: "x", password: "hunter2", apiKey: "k", token: "t", note: "n".repeat(500) }) ?? "{}",
    );
    expect(json.password).toBe("[redacted]");
    expect(json.apiKey).toBe("[redacted]");
    expect(json.token).toBe("[redacted]");
    expect(json.name).toBe("x");
    expect(json.note.length).toBeLessThan(400);
    expect(sanitizeAuditData(null)).toBeNull();
  });
});

describe("recordAudit", () => {
  it("stores actor, before and after, and filters by entity and action", async () => {
    await recordAudit(db, {
      actor: { id: "a1", role: "ADMIN" },
      action: "order.status",
      entityType: "order",
      entityId: "o1",
      before: { status: "PAID" },
      after: { status: "PROCESSING" },
    });
    await recordAudit(db, { actor: { id: "a1", role: "ADMIN" }, action: "coupon.create", entityType: "coupon", entityId: "c1", after: { code: "SAVE10" } });

    const all = await listAuditLogs(db);
    expect(all).toHaveLength(2);

    const orders = await listAuditLogs(db, { entityType: "order" });
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      actorName: "Admin",
      actorRole: "ADMIN",
      action: "order.status",
      entityId: "o1",
    });
    expect(JSON.parse(orders[0].before ?? "{}")).toEqual({ status: "PAID" });
    expect(JSON.parse(orders[0].after ?? "{}")).toEqual({ status: "PROCESSING" });

    expect(await listAuditLogs(db, { action: "coupon." })).toHaveLength(1);
  });

  it("never throws when the write fails", async () => {
    await expect(
      recordAudit(db, { actor: { id: "missing-user", role: null }, action: "x", entityType: "x" }),
    ).resolves.toBeUndefined();
  });
});
