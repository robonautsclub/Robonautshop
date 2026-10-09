import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { absoluteUrl, buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/seo/structured-data";

const original = process.env.NEXT_PUBLIC_SITE_URL;

beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://robonautsshop.com/";
});

afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = original;
});

describe("absoluteUrl", () => {
  it("joins site paths onto the site origin", () => {
    expect(absoluteUrl("/products/nano")).toBe("https://robonautsshop.com/products/nano");
    expect(absoluteUrl("kits")).toBe("https://robonautsshop.com/kits");
  });

  it("leaves absolute image URLs alone", () => {
    expect(absoluteUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
  });
});

describe("buildPageMetadata", () => {
  it("sets a canonical URL and matching Open Graph URL", () => {
    const metadata = buildPageMetadata({ title: "Nano", path: "/products/nano" });
    expect(metadata.alternates?.canonical).toBe("https://robonautsshop.com/products/nano");
    expect(metadata.openGraph).toMatchObject({ url: "https://robonautsshop.com/products/nano" });
  });

  it("falls back to the logo when the page has no image", () => {
    const metadata = buildPageMetadata({ title: "Motors", path: "/categories/motors" });
    expect(metadata.openGraph).toMatchObject({
      images: [{ url: "https://robonautsshop.com/logo.png" }],
    });
  });
});

describe("structured data", () => {
  it("numbers breadcrumb items from 1 with absolute URLs", () => {
    expect(breadcrumbJsonLd([{ name: "Kits", path: "/kits" }])).toMatchObject({
      itemListElement: [{ position: 1, item: "https://robonautsshop.com/kits" }],
    });
  });

  it("cannot be used to close the script tag", () => {
    const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json).name).toBe("</script><script>alert(1)</script>");
  });
});
