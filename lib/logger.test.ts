import { describe, expect, it } from "vitest";

import { formatLogLine, isSecretKey, maskPhone, requestIdFromHeaders } from "@/lib/logger";

describe("formatLogLine", () => {
  it("writes one JSON line with level, time, event and error details", () => {
    const line = JSON.parse(
      formatLogLine("error", "contact.send_failed", { requestId: "r1" }, new Error("SES down"), new Date("2026-10-12T00:00:00Z")),
    );
    expect(line).toMatchObject({
      level: "error",
      time: "2026-10-12T00:00:00.000Z",
      event: "contact.send_failed",
      requestId: "r1",
      error: { name: "Error", message: "SES down" },
    });
    expect(line.error.stack).toContain("SES down");
  });

  it("redacts secrets and masks phone numbers", () => {
    const line = JSON.parse(
      formatLogLine("info", "x", {
        password: "hunter2",
        bkashToken: "abc",
        cardNumber: "4111111111111111",
        shippingPhone: "01712345678",
        orderId: "o1",
      }),
    );
    expect(line.password).toBe("[redacted]");
    expect(line.bkashToken).toBe("[redacted]");
    expect(line.cardNumber).toBe("[redacted]");
    expect(line.shippingPhone).toBe("********678");
    expect(line.orderId).toBe("o1");
    expect(JSON.stringify(line)).not.toContain("hunter2");
    expect(JSON.stringify(line)).not.toContain("01712345678");
  });

  it("handles non-Error throwables", () => {
    expect(JSON.parse(formatLogLine("error", "x", {}, "plain string")).error.message).toBe("plain string");
  });
});

describe("maskPhone", () => {
  it("keeps only the last three digits", () => {
    expect(maskPhone("+880 1712-345678")).toBe("**********678");
    expect(maskPhone("12")).toBe("***");
  });
});

describe("requestIdFromHeaders", () => {
  it("prefers x-request-id, then cf-ray, then generates one", () => {
    expect(requestIdFromHeaders(new Headers({ "x-request-id": "abc-1", "cf-ray": "ray" }))).toBe("abc-1");
    expect(requestIdFromHeaders(new Headers({ "cf-ray": "ray123-DAC" }))).toBe("ray123-DAC");
    expect(requestIdFromHeaders(new Headers())).toMatch(/^[0-9a-f-]{36}$/);
    expect(requestIdFromHeaders(new Headers({ "x-request-id": "bad value with spaces" }))).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("isSecretKey", () => {
  it("flags secrets but not ordinary words that contain pin/otp", () => {
    for (const key of ["password", "apiKey", "authToken", "pin", "bkash_pin", "userOtp", "cookie", "cardNumber"]) {
      expect(isSecretKey(key)).toBe(true);
    }
    for (const key of ["shippingCity", "shippingPhone", "hotpot", "status", "orderId"]) {
      expect(isSecretKey(key)).toBe(false);
    }
  });
});
