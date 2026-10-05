import { AdminCouponsShell } from "@/components/admin/admin-coupons-shell";
import { getRequestDb } from "@/lib/db/request";
import { listCoupons } from "@/lib/coupons/queries";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const db = await getRequestDb();
  const coupons = await listCoupons(db);

  return <AdminCouponsShell coupons={coupons} />;
}
