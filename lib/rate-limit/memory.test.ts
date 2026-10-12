import { afterEach, describe, expect, it, vi } from "vitest";

import { checkRateLimit } from "@/lib/rate-limit/memory";

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows up to the limit, then blocks until the window resets", () => {
    vi.useFakeTimers();
    const rule = { limit: 2, windowMs: 1000 };
    expect(checkRateLimit("t:a", rule).allowed).toBe(true);
    expect(checkRateLimit("t:a", rule).allowed).toBe(true);
    expect(checkRateLimit("t:a", rule).allowed).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(checkRateLimit("t:a", rule).allowed).toBe(true);
  });

  it("tracks each key separately", () => {
    const rule = { limit: 1, windowMs: 60_000 };
    expect(checkRateLimit("t:b", rule).allowed).toBe(true);
    expect(checkRateLimit("t:c", rule).allowed).toBe(true);
    expect(checkRateLimit("t:b", rule).allowed).toBe(false);
  });
});
