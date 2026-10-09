import { serializeJsonLd, type JsonLdObject } from "@/lib/seo/structured-data";

/** Inline schema.org structured data (server component). */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      // Safe: serializeJsonLd escapes `<`, so the payload cannot break out.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
