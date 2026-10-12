import { describe, expect, it } from "vitest";

import { twoFactorRequired } from "@/lib/auth/two-factor";

const ON = { ADMIN_2FA_REQUIRED: "true" };

describe("twoFactorRequired", () => {
  it("is off unless ADMIN_2FA_REQUIRED=true", () => {
    expect(twoFactorRequired({ role: "ADMIN", twoFactorEnabled: false }, {})).toBe(false);
    expect(twoFactorRequired({ role: "ADMIN", twoFactorEnabled: false }, { ADMIN_2FA_REQUIRED: "false" })).toBe(false);
  });

  it("requires enrollment for back-office accounts without 2FA when enabled", () => {
    expect(twoFactorRequired({ role: "ADMIN", twoFactorEnabled: false }, ON)).toBe(true);
    expect(twoFactorRequired({ role: "ORDER_MANAGER" }, ON)).toBe(true);
  });

  it("is satisfied once 2FA is enabled", () => {
    expect(twoFactorRequired({ role: "ADMIN", twoFactorEnabled: true }, ON)).toBe(false);
  });

  it("never applies to customers", () => {
    expect(twoFactorRequired({ role: "CUSTOMER", twoFactorEnabled: false }, ON)).toBe(false);
  });
});
