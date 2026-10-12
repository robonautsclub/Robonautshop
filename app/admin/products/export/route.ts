import { csvResponse } from "@/lib/admin/csv-response";
import { listAdminCategories, listAdminProducts } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/session";
import { PRODUCT_STATUS_VALUES } from "@/lib/db/schema/shared";
import { getRequestDb } from "@/lib/db/request";

export const dynamic = "force-dynamic";

const HEADERS = [
  "ID",
  "Name",
  "SKU",
  "Brand",
  "Category",
  "Price (BDT)",
  "Compare-at (BDT)",
  "Status",
  "Featured",
  "Created",
];

/** GET /admin/products/export?q=&status= — same search and status filter as the page. Needs catalog.manage. */
export async function GET(request: Request) {
  await requirePermission("catalog.manage");

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const statusParam = url.searchParams.get("status") ?? "";
  const status = PRODUCT_STATUS_VALUES.find((value) => value === statusParam);

  const db = await getRequestDb();
  const [products, categories] = await Promise.all([listAdminProducts(db), listAdminCategories(db)]);
  const categoryName = new Map(categories.map((category) => [category.id, category.name]));

  const rows = products
    .filter(
      (product) =>
        (!status || product.status === status) &&
        (!q || product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q)),
    )
    .map((product) => [
      product.id,
      product.name,
      product.sku,
      product.brand,
      categoryName.get(product.categoryId) ?? "",
      product.price,
      product.compareAtPrice,
      product.status,
      product.featured,
      product.createdAt,
    ]);

  return csvResponse("products", HEADERS, rows);
}
