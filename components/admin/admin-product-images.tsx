"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AdminDeleteTrigger } from "@/components/admin/admin-confirm-delete-dialog";
import { fieldClassName } from "@/components/admin/admin-form-dialog";
import { useAdminSave } from "@/components/admin/use-admin-save";
import { Button } from "@/components/ui/button";
import {
  deleteProductImageAction,
  moveProductImageAction,
  updateProductImageAltAction,
} from "@/lib/admin/catalog-actions";
import type { ProductImage } from "@/lib/catalog";

/**
 * Upload, order and remove a product's images (tasks/phase-19-admin-catalog/123).
 * Uploads go straight to R2 via /api/admin/product-images; the first image
 * is the product's main image.
 */
export function AdminProductImages({
  productId,
  productName,
  images,
}: {
  productId: string;
  productName: string;
  images: ProductImage[];
}) {
  const router = useRouter();
  const save = useAdminSave();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("productId", productId);
    setUploadError(null);
    setUploading(true);
    try {
      const response = await fetch("/api/admin/product-images", { method: "POST", body: data });
      const body = (await response.json()) as { ok: boolean; error?: string };
      if (!body.ok) {
        setUploadError(body.error ?? "Upload failed.");
        return;
      }
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Image upload request failed", error);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-3 border-t pt-4" aria-labelledby="admin-product-images-title">
      <h3 id="admin-product-images-title" className="text-sm font-semibold tracking-tight">
        Images
      </h3>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images yet. The storefront shows a placeholder.</p>
      ) : (
        <ul className="space-y-2">
          {images.map((image, index) => (
            <li key={image.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-2">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="56px" />
              </div>
              <label className="min-w-40 flex-1 space-y-1 text-xs font-medium">
                Alt text {index === 0 ? "· main image" : null}
                <input
                  value={altDrafts[image.id] ?? image.alt}
                  onChange={(event) => setAltDrafts((current) => ({ ...current, [image.id]: event.target.value }))}
                  className={fieldClassName()}
                />
              </label>
              <div className="flex flex-wrap gap-1">
                {altDrafts[image.id] !== undefined && altDrafts[image.id] !== image.alt ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={save.pending}
                    onClick={() => void save.run(() => updateProductImageAltAction(image.id, altDrafts[image.id]))}
                  >
                    Save alt
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="Move image up"
                  disabled={index === 0 || save.pending}
                  onClick={() => void save.run(() => moveProductImageAction(image.id, "up"))}
                >
                  <ArrowUp aria-hidden className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="Move image down"
                  disabled={index === images.length - 1 || save.pending}
                  onClick={() => void save.run(() => moveProductImageAction(image.id, "down"))}
                >
                  <ArrowDown aria-hidden className="size-4" />
                </Button>
                <AdminDeleteTrigger
                  itemLabel={`this image of ${productName}`}
                  title="Remove image?"
                  buttonLabel="Remove"
                  buttonVariant="ghost"
                  onConfirm={() => void save.run(() => deleteProductImageAction(image.id))}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {save.error ? (
        <p className="text-sm text-destructive" role="alert">
          {save.error}
        </p>
      ) : null}

      <form onSubmit={onUpload} className="grid gap-2 rounded-lg border border-dashed p-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="space-y-1 text-xs font-medium">
          Image (JPEG, PNG or WebP, max 5 MB)
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="block w-full text-sm file:mr-2 file:rounded-md file:border file:bg-background file:px-2 file:py-1"
          />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Alt text
          <input name="alt" required defaultValue={productName} className={fieldClassName()} />
        </label>
        <div className="flex items-end">
          <Button type="submit" size="sm" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
        {uploadError ? (
          <p className="text-sm text-destructive sm:col-span-3" role="alert">
            {uploadError}
          </p>
        ) : null}
      </form>
    </section>
  );
}
