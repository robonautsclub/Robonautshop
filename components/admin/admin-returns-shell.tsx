"use client";

import Link from "next/link";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-table";
import { useAdminSave } from "@/components/admin/use-admin-save";
import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { decideReturnAction } from "@/lib/returns/actions";
import type { AdminReturnRequest } from "@/lib/returns/queries";

const STATUS_TONE = { PENDING: "warning", APPROVED: "success", REJECTED: "neutral" } as const;

function RequestRow({ request }: { request: AdminReturnRequest }) {
  const save = useAdminSave();
  const [adminNote, setAdminNote] = useState(request.adminNote ?? "");
  const decided = request.status !== "PENDING";

  function decide(decision: "APPROVED" | "REJECTED") {
    void save.run(
      () => decideReturnAction({ requestId: request.id, decision, adminNote }),
      decision === "APPROVED" ? "Approved." : "Rejected.",
    );
  }

  return (
    <li className="space-y-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <Link href={`/admin/orders/${request.orderId}`} className="font-medium text-foreground hover:underline">
            Order {request.orderId.slice(0, 8)}
          </Link>{" "}
          · {request.customerName} · {new Date(request.createdAt).toLocaleDateString()}
        </p>
        <AdminStatusBadge tone={STATUS_TONE[request.status]}>{request.status}</AdminStatusBadge>
      </div>
      <p className="text-sm font-medium">
        {request.type === "RETURN" ? "Return" : "Warranty claim"}: {request.productName} ({request.sku}) ×{" "}
        {request.quantity}
      </p>
      <p className="text-sm text-muted-foreground">
        Reason: {request.reason.replaceAll("_", " ").toLowerCase()}
        {request.note ? ` — ${request.note}` : ""}
      </p>

      <div className="space-y-1.5">
        <label htmlFor={`return-note-${request.id}`} className="text-xs font-medium">
          Note to customer
        </label>
        <textarea
          id={`return-note-${request.id}`}
          rows={2}
          value={adminNote}
          disabled={decided}
          onChange={(event) => setAdminNote(event.target.value)}
          className={`${fieldClassName()} min-h-16 py-2`}
        />
      </div>

      {decided ? null : (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" disabled={save.pending} onClick={() => decide("APPROVED")}>
            Approve
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={save.pending} onClick={() => decide("REJECTED")}>
            Reject
          </Button>
          {request.type === "RETURN" ? (
            <span className="text-xs text-muted-foreground">Approving a return restocks the item.</span>
          ) : null}
        </div>
      )}
      {save.error ? (
        <p className="text-sm text-destructive" role="alert">
          {save.error}
        </p>
      ) : null}
      {save.status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {save.status}
        </p>
      ) : null}
    </li>
  );
}

export function AdminReturnsShell({ requests }: { requests: AdminReturnRequest[] }) {
  const pending = requests.filter((request) => request.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Returns & warranty"
        description={`${requests.length} requests · ${pending} pending. Refunds and replacements are handled manually outside the app.`}
      />
      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No return or warranty requests yet.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </ul>
      )}
    </div>
  );
}
