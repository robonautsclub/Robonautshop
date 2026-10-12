import { describe, expect, it } from "vitest";

import { describeUserAgent } from "@/lib/account/user-agent";

describe("describeUserAgent", () => {
  it("names browser and OS", () => {
    expect(
      describeUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBe("Chrome on macOS");
    expect(
      describeUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("Safari on iOS");
  });

  it("falls back for missing or unknown agents", () => {
    expect(describeUserAgent(null)).toBe("Unknown device");
    expect(describeUserAgent("curl/8.0")).toBe("Unknown device");
  });
});
