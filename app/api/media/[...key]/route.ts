import { isProductImageKey } from "@/lib/media/images";
import { getProductImagesBucket } from "@/lib/media/r2";

export const runtime = "nodejs";

/**
 * Serves product images from R2 (tasks/phase-19-admin-catalog/123). Only
 * keys in the product image format are readable — no listing, no other
 * prefixes. Keys are random and never reused, so responses cache forever.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: segments } = await params;
  const key = segments.join("/");
  if (!isProductImageKey(key)) {
    return new Response("Not found", { status: 404 });
  }

  const bucket = await getProductImagesBucket();
  const object = await bucket.get(key);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ETag: object.httpEtag,
    },
  });
}
