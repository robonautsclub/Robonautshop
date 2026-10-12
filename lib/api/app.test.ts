import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { app } from "@/lib/api/app";

// Routes must be added before the first request is handled.
beforeAll(() => {
  app.get("/_test/boom", () => {
    throw new Error("forced failure with secret-ish detail");
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("API error handling", () => {
  it("returns a safe message and writes one structured log line with the request id", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await app.request("/api/_test/boom", { headers: { "x-request-id": "req-123" } });
    const body = (await response.json()) as { status: string; message: string };

    expect(response.status).toBe(500);
    expect(response.headers.get("x-request-id")).toBe("req-123");
    expect(body.message).toBe("Something went wrong. Please try again.");
    expect(JSON.stringify(body)).not.toContain("forced failure");

    expect(spy).toHaveBeenCalledTimes(1);
    const line = JSON.parse(String(spy.mock.calls[0][0]));
    expect(line).toMatchObject({
      level: "error",
      event: "api.unhandled_error",
      requestId: "req-123",
      path: "/api/_test/boom",
      error: { name: "Error", message: "forced failure with secret-ish detail" },
    });
  });

  it("stamps successful responses with a request id too", async () => {
    const response = await app.request("/api/health");
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });
});
