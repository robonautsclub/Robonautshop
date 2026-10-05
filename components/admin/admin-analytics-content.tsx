"use client";

import Link from "next/link";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTable, AdminTableHead, AdminTd, AdminTh } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { runAbandonedCartRemindersAction } from "@/lib/abandoned-carts/actions";
import type { AnalyticsSummary } from "@/lib/analytics/queries";

/** Basic storefront analytics hooks (tasks/phase-14-advanced/90-analytics.md) — self-hosted, no external service. */
export function AdminAnalyticsContent({ summary }: { summary: AnalyticsSummary }) {
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function onRunReminders() {
    setRunning(true);
    setReminderStatus(null);
    const result = await runAbandonedCartRemindersAction();
    setRunning(false);
    setReminderStatus(
      result.sent === 0
        ? "No idle carts needed a reminder right now."
        : `Sent ${result.sent} abandoned cart reminder${result.sent === 1 ? "" : "s"}.`,
    );
  }

  const cards = [
    { label: "Product views", value: summary.productViews },
    { label: "Searches", value: summary.searches },
    { label: "Add to carts", value: summary.addToCarts },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Last 30 days — product views, searches, and add-to-cart events logged from the storefront."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border p-5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border p-5">
        <h2 className="text-lg font-semibold tracking-tight">Top viewed products</h2>
        {summary.topProducts.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No product views recorded yet.</p>
        ) : (
          <AdminTable className="mt-4">
            <AdminTableHead>
              <AdminTh>Product</AdminTh>
              <AdminTh className="text-right">Views</AdminTh>
            </AdminTableHead>
            <tbody>
              {summary.topProducts.map((row) => (
                <tr key={row.productId} className="hover:bg-muted/30">
                  <AdminTd>{row.productName}</AdminTd>
                  <AdminTd className="text-right font-medium">{row.views}</AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="text-lg font-semibold tracking-tight">Top searches</h2>
        {summary.topSearches.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No searches recorded yet.</p>
        ) : (
          <AdminTable className="mt-4">
            <AdminTableHead>
              <AdminTh>Query</AdminTh>
              <AdminTh className="text-right">Count</AdminTh>
            </AdminTableHead>
            <tbody>
              {summary.topSearches.map((row) => (
                <tr key={row.query} className="hover:bg-muted/30">
                  <AdminTd>
                    <Link
                      href={`/products?q=${encodeURIComponent(row.query)}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {row.query}
                    </Link>
                  </AdminTd>
                  <AdminTd className="text-right font-medium">{row.count}</AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="text-lg font-semibold tracking-tight">Abandoned cart reminders</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Runs automatically every 6 hours (Cron Trigger). Use this to test it on demand.
        </p>
        <Button type="button" className="mt-3" onClick={() => void onRunReminders()} disabled={running}>
          {running ? "Running…" : "Run now"}
        </Button>
        {reminderStatus ? (
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            {reminderStatus}
          </p>
        ) : null}
      </section>
    </div>
  );
}
