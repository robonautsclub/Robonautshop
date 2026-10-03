import type { MetadataRoute } from "next";

import {
  getCategories,
  getKits,
  getProducts,
  getProjects,
} from "@/lib/catalog";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

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

  const productRoutes = getProducts().map((product) => ({
    url: `${base}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryRoutes = getCategories().map((category) => ({
    url: `${base}/categories/${category.slug}`,
    lastModified: new Date(category.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const kitRoutes = getKits().map((kit) => ({
    url: `${base}/kits/${kit.slug}`,
    lastModified: new Date(kit.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const projectRoutes = getProjects().map((project) => ({
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
