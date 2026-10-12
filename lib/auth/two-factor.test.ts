import { describe, expect, it } from "vitest";

import { twoFactorRequired } from "@/lib/auth/two-factor";

describe("twoFactorRequired", () => {
  it("requires enrollment for back-office accounts without 2FA", () => {
    expect(twoFactorRequired({ role: "ADMIN", twoFactorEnabled: false }, {})).toBe(true);
    expect(twoFactorRequired({ role: "ORDER_MANAGER" }, {})).toBe(true);
  });

  it("is satisfied once 2FA is enabled", () => {
    expect(twoFactorRequired({ role: "ADMIN", twoFactorEnabled: true }, {})).toBe(false);
  });

  it("never applies to customers", () => {
    expect(twoFactorRequired({ role: "CUSTOMER", twoFactorEnabled: false }, {})).toBe(false);
  });

  it("allows a development opt-out but never in production", () => {
    expect(twoFactorRequired({ role: "ADMIN" }, { NODE_ENV: "development", ADMIN_2FA_REQUIRED: "false" })).toBe(false);
    expect(twoFactorRequired({ role: "ADMIN" }, { NODE_ENV: "production", ADMIN_2FA_REQUIRED: "false" })).toBe(true);
  });
});
