import Link from "next/link";

export type FrequentlyBoughtItem = { productId: string; name: string; slug: string };

/** Simple "customers who bought this also bought" list (tasks/phase-14-advanced/88-recommendations.md). */
export function FrequentlyBoughtTogether({ items }: { items: FrequentlyBoughtItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-14">
      <h2 className="text-xl font-semibold tracking-tight">Frequently bought together</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Based on what other customers ordered alongside this item.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.productId}>
            <Link
              href={`/products/${item.slug}`}
              className="inline-flex rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:border-foreground/30"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
