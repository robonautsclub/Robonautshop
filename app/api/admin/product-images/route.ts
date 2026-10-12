import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { addProductImage, productExists } from "@/lib/admin/product-images";
import { getServerSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import {
  buildProductImageKey,
  MAX_IMAGE_BYTES,
  mediaUrlForKey,
  validateImageUpload,
} from "@/lib/media/images";
import { getProductImagesBucket } from "@/lib/media/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fieldsSchema = z.object({
  productId: z.string().trim().min(1, "Missing product."),
  alt: z.string().trim().min(1, "Add alt text describing the image.").max(200),
});

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * Admin product image upload to R2 (tasks/phase-19-admin-catalog/123).
 * The role is checked here, server-side; the file type comes from its
 * bytes, and the object key is random — the uploaded filename is never used.
 */
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return jsonError("Please sign in.", 401);
  if (session.user.role !== "ADMIN") return jsonError("Not allowed.", 403);

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_IMAGE_BYTES + 64 * 1024) {
    return jsonError("Images must be 5 MB or smaller.", 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Invalid upload.", 400);
  }

  const fields = fieldsSchema.safeParse({ productId: form.get("productId"), alt: form.get("alt") });
  if (!fields.success) {
    return jsonError(fields.error.issues[0]?.message ?? "Invalid upload.", 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("Choose an image to upload.", 400);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const validation = validateImageUpload(file.name, bytes.byteLength, bytes);
  if (!validation.ok) {
    return jsonError(validation.error, 400);
  }

  const db = await getRequestDb();
  if (!(await productExists(db, fields.data.productId))) {
    return jsonError("Product not found.", 404);
  }

  const bucket = await getProductImagesBucket();
  const key = buildProductImageKey(fields.data.productId, validation.extension);
  try {
    await bucket.put(key, bytes, { httpMetadata: { contentType: validation.contentType } });
    const image = await addProductImage(db, {
      productId: fields.data.productId,
      url: mediaUrlForKey(key),
      alt: fields.data.alt,
    });
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, image });
  } catch (error) {
    console.error("Product image upload failed", error);
    await bucket.delete(key).catch((cleanupError: unknown) => {
      console.error("Could not remove orphaned R2 object", key, cleanupError);
    });
    return jsonError("Upload failed. Please try again.", 500);
  }
}
