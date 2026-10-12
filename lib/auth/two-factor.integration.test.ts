import { createHmac } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { buildAuth } from "@/lib/auth/server";
import type { Database } from "@/lib/db";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Decodes the otpauth secret (base32 of the plugin's random string) back to that string. */
function decodeSecret(base32: string): string {
  let bits = "";
  for (const char of base32.replace(/=+$/, "")) {
    bits += BASE32.indexOf(char).toString(2).padStart(5, "0");
  }
  let out = "";
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    out += String.fromCharCode(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return out;
}

/** RFC 6238 TOTP (SHA-1, 30 s, 6 digits) — what authenticator apps compute. */
function totp(secret: string, now = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 1000 / 30)));
  const hmac = createHmac("sha1", Buffer.from(secret, "utf8")).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const value = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(value).padStart(6, "0");
}

function cookieHeader(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

beforeAll(async () => {
  vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-test-secret-test-secret-1234");
  vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
  ({ db, dispose } = await createTestDb());
});

afterAll(async () => {
  await dispose();
  vi.unstubAllEnvs();
});

describe("two-factor wiring", () => {
  it("enrolls with TOTP and then asks for a code at sign-in", async () => {
    const auth = buildAuth(db, { withNextCookies: false });

    const signUp = await auth.api.signUpEmail({
      body: { name: "Admin", email: "admin@example.com", password: "correct-horse-battery" },
      asResponse: true,
    });
    const cookie = cookieHeader(signUp);
    expect(cookie).toContain("session_token");

    const enabled = await auth.api.enableTwoFactor({
      body: { password: "correct-horse-battery" },
      headers: new Headers({ cookie }),
    });
    if (enabled.method !== "totp") throw new Error("expected totp");
    expect(enabled.backupCodes.length).toBeGreaterThan(0);

    const secret = decodeSecret(new URL(enabled.totpURI).searchParams.get("secret") ?? "");
    const code = totp(secret);
    await auth.api.verifyTOTP({ body: { code }, headers: new Headers({ cookie }) });

    const signIn = await auth.api.signInEmail({
      body: { email: "admin@example.com", password: "correct-horse-battery" },
      asResponse: true,
    });
    const body = (await signIn.json()) as { twoFactorRedirect?: boolean };
    expect(body.twoFactorRedirect).toBe(true);
  });
});
