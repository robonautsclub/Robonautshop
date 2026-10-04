import type { MetadataRoute } from "next";

import {
  getCategories,
  getKits,
  getProducts,
  getProjects,
} from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";
import { getSiteUrl } from "@/lib/site-url";

// Reads the catalog from D1 (tasks/phase-12-wire-up/75), only reachable at
// request time, not during `next build`'s static prerendering.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const db = await getRequestDb();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/categories",
    "/kits",
    "/projects",
    "/builder",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const [products, categories, kits, projects] = await Promise.all([
    getProducts(db),
    getCategories(db),
    getKits(db),
    getProjects(db),
  ]);

  const productRoutes = products.map((product) => ({
    url: `${base}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${base}/categories/${category.slug}`,
    lastModified: new Date(category.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const kitRoutes = kits.map((kit) => ({
    url: `${base}/kits/${kit.slug}`,
    lastModified: new Date(kit.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const projectRoutes = projects.map((project) => ({
    url: `${base}/projects/${project.slug}`,
    lastModified: new Date(project.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...kitRoutes,
    ...projectRoutes,
  ];
}
