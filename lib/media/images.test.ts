import { describe, expect, it } from "vitest";

import {
  buildProductImageKey,
  keyFromMediaUrl,
  mediaUrlForKey,
  validateImageUpload,
} from "@/lib/media/images";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const exe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);

describe("validateImageUpload", () => {
  it("accepts a real PNG", () => {
    expect(validateImageUpload("board.png", 10, png)).toMatchObject({ ok: true, contentType: "image/png" });
  });

  it("accepts .jpeg for JPEG bytes", () => {
    expect(validateImageUpload("photo.JPEG", 4, jpeg)).toMatchObject({ ok: true, extension: "jpg" });
  });

  it("rejects an executable renamed to .png", () => {
    expect(validateImageUpload("virus.png", 4, exe).ok).toBe(false);
  });

  it("rejects a mismatched extension", () => {
    expect(validateImageUpload("photo.png", 4, jpeg).ok).toBe(false);
  });

  it("rejects files over 5 MB", () => {
    expect(validateImageUpload("big.png", 6 * 1024 * 1024, png).ok).toBe(false);
  });
});

describe("media keys", () => {
  it("round-trips our keys and ignores external URLs", () => {
    const key = buildProductImageKey("p-1", "webp");
    expect(keyFromMediaUrl(mediaUrlForKey(key))).toBe(key);
    expect(keyFromMediaUrl("https://picsum.photos/400")).toBeNull();
    expect(keyFromMediaUrl("/api/media/../secrets")).toBeNull();
  });
});
