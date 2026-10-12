import { csvResponse } from "@/lib/admin/csv-response";
import { listAdminInventory } from "@/lib/admin";
import { requirePermission } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";

export const dynamic = "force-dynamic";

const HEADERS = ["SKU", "Product", "Stock", "Reserved", "Available", "Low-stock alert at", "Low stock"];

/** GET /admin/inventory/export?q= — same search as the page. Needs inventory.manage. */
export async function GET(request: Request) {
  await requirePermission("inventory.manage");

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().toLowerCase();
  const db = await getRequestDb();
  const rows = (await listAdminInventory(db))
    .filter((row) => !q || row.productName.toLowerCase().includes(q) || row.sku.toLowerCase().includes(q))
    .map((row) => [
      row.sku,
      row.productName,
      row.stockQuantity,
      row.reservedQuantity,
      row.availableQuantity,
      row.lowStockThreshold,
      row.availableQuantity <= row.lowStockThreshold,
    ]);

  return csvResponse("inventory", HEADERS, rows);
}
