/**
 * Product image upload rules (tasks/phase-19-admin-catalog/123,
 * AGENTS.md §37 "File Uploads"). Pure functions — no R2 or D1 here.
 *
 * The file's real type comes from its first bytes ("magic numbers"), never
 * from the filename or the browser-supplied MIME type, and the extension
 * must agree with it.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const IMAGE_TYPES = {
  "image/jpeg": { extension: "jpg", accepts: ["jpg", "jpeg"] },
  "image/png": { extension: "png", accepts: ["png"] },
  "image/webp": { extension: "webp", accepts: ["webp"] },
} as const;

export type ImageContentType = keyof typeof IMAGE_TYPES;

export function detectImageType(bytes: Uint8Array): ImageContentType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= png.length && png.every((byte, index) => bytes[index] === byte)) {
    return "image/png";
  }
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

export type ImageValidation =
  | { ok: true; contentType: ImageContentType; extension: string }
  | { ok: false; error: string };

export function validateImageUpload(
  fileName: string,
  size: number,
  bytes: Uint8Array,
): ImageValidation {
  if (size === 0) {
    return { ok: false, error: "The file is empty." };
  }
  if (size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Images must be 5 MB or smaller." };
  }
  const contentType = detectImageType(bytes);
  if (!contentType) {
    return { ok: false, error: "Only JPEG, PNG or WebP images are allowed." };
  }
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const accepted: readonly string[] = IMAGE_TYPES[contentType].accepts;
  if (!accepted.includes(extension)) {
    return { ok: false, error: "The file extension doesn't match the image type." };
  }
  return { ok: true, contentType, extension: IMAGE_TYPES[contentType].extension };
}

const MEDIA_PREFIX = "/api/media/";
const KEY_PATTERN = /^products\/[A-Za-z0-9-]+\/[A-Za-z0-9-]+\.(jpg|png|webp)$/;

/** Random, unguessable object key — the uploaded filename is never used. */
export function buildProductImageKey(productId: string, extension: string): string {
  return `products/${productId}/${crypto.randomUUID()}.${extension}`;
}

export function isProductImageKey(key: string): boolean {
  return KEY_PATTERN.test(key);
}

export function mediaUrlForKey(key: string): string {
  return `${MEDIA_PREFIX}${key}`;
}

/** The R2 key behind one of our media URLs, or null for external (e.g. seed) URLs. */
export function keyFromMediaUrl(url: string): string | null {
  if (!url.startsWith(MEDIA_PREFIX)) return null;
  const key = url.slice(MEDIA_PREFIX.length);
  return isProductImageKey(key) ? key : null;
}
