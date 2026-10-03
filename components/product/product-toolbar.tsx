import type { Category, ProductSort } from "@/lib/catalog";

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export type ProductToolbarValues = {
  q: string;
  category: string;
  inStock: boolean;
  sort: ProductSort;
};

type ProductToolbarProps = {
  categories: Category[];
  values: ProductToolbarValues;
  action?: string;
};

export function ProductToolbar({
  categories,
  values,
  action = "/products",
}: ProductToolbarProps) {
  return (
    <form
      method="get"
      action={action}
      className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
        <label htmlFor="product-q" className="text-xs font-medium">
          Search
        </label>
        <input
          id="product-q"
          name="q"
          type="search"
          defaultValue={values.q}
          placeholder="Name, SKU, description…"
          className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex min-w-[10rem] flex-col gap-1.5">
        <label htmlFor="product-category" className="text-xs font-medium">
          Category
        </label>
        <select
          id="product-category"
          name="category"
          defaultValue={values.category}
          className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-[10rem] flex-col gap-1.5">
        <label htmlFor="product-sort" className="text-xs font-medium">
          Sort
        </label>
        <select
          id="product-sort"
          name="sort"
          defaultValue={values.sort}
          className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex h-9 items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="inStock"
          value="1"
          defaultChecked={values.inStock}
          className="size-4 rounded border"
        />
        In stock only
      </label>

      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Apply
      </button>
    </form>
  );
}

export function parseProductSort(value: string | undefined): ProductSort {
  switch (value) {
    case "name-asc":
    case "name-desc":
    case "price-asc":
    case "price-desc":
    case "newest":
      return value;
    default:
      return "newest";
  }
}
