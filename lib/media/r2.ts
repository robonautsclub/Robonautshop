import { getCloudflareContext } from "@opennextjs/cloudflare";

/** The product image R2 bucket (wrangler.jsonc `PRODUCT_IMAGES`). Request-scoped, like getRequestDb(). */
export async function getProductImagesBucket(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true });
  return env.PRODUCT_IMAGES;
}
