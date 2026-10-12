import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/site-url";

/** Site-wide fallback share image (the store logo). */
export const DEFAULT_OG_IMAGE = {
  url: "/logo.png",
  width: 1024,
  height: 1024,
  alt: "Robonautsshop",
};

/** Absolute URL for a site path — SEO tags must not use relative URLs. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetadataInput = {
  title: string;
  description?: string;
  /** Site path of the page, e.g. `/products/arduino-nano`. */
  path: string;
  /** A real image of the thing on the page, if it has one. */
  image?: { url: string; alt: string } | null;
  type?: "website" | "article";
};

/**
 * The one builder for public page metadata (tasks/phase-18-hardening/111):
 * canonical URL + Open Graph + Twitter card from the same values, so detail
 * pages never drift apart. Next.js replaces (does not merge) a parent's
 * `openGraph`, so pages without their own image get the logo explicitly.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const images = image
    ? [{ url: absoluteUrl(image.url), alt: image.alt }]
    : [{ ...DEFAULT_OG_IMAGE, url: absoluteUrl(DEFAULT_OG_IMAGE.url) }];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: "Robonautsshop",
      locale: "en_BD",
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: images.map((item) => item.url),
    },
  };
}
