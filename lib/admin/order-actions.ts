"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { ORDER_STATUS_VALUES } from "@/lib/db/schema/shared";
import {
  updateOrderStatus,
  type UpdateOrderStatusResult,
} from "@/lib/orders/status-queries";

const updateOrderStatusSchema = z.object({
  orderId: z.string().trim().min(1, "Missing order."),
  status: z.enum(ORDER_STATUS_VALUES, "Choose a valid status."),
});

/**
 * Admin-only order fulfilment step (tasks/phase-18-hardening/108).
 * requireAdminSession() redirects/403s non-admins itself — the role is
 * checked here, server-side, not only by hiding the control.
 */
export async function updateOrderStatusAction(
  orderId: string,
  status: string,
): Promise<UpdateOrderStatusResult> {
  await requireAdminSession();

  const parsed = updateOrderStatusSchema.safeParse({ orderId, status });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid status." };
  }

  const db = await getRequestDb();
  const result = await updateOrderStatus(db, parsed.data.orderId, parsed.data.status);
  if (result.ok) {
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    revalidatePath("/admin/inventory");
  }
  return result;
}
