"use client";

import { useState } from "react";

import { AdminDeleteTrigger } from "@/components/admin/admin-confirm-delete-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminPagination,
  useAdminPagination,
} from "@/components/admin/admin-pagination";
import {
  AdminTable,
  AdminTableHead,
  AdminTableToolbarSearch,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import type { AdminCustomer } from "@/lib/admin";
import { formatBdt } from "@/lib/catalog";

export function AdminCustomersShell({
  customers: initialCustomers,
}: {
  customers: AdminCustomer[];
}) {
  const [rows, setRows] = useState(initialCustomers);
  const [status, setStatus] = useState<string | null>(null);
  const pagination = useAdminPagination(rows, 20);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description={`${rows.length} customers · Delete always asks for confirmation.`}
        toolbar={
          <>
            <AdminTableToolbarSearch placeholder="Search customers" />
            <p className="text-xs text-muted-foreground">
              Customer records
            </p>
          </>
        }
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Name</AdminTh>
          <AdminTh>Email</AdminTh>
          <AdminTh>Phone</AdminTh>
          <AdminTh>City</AdminTh>
          <AdminTh>Orders</AdminTh>
          <AdminTh className="text-right">Spent</AdminTh>
          <AdminTh>Joined</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody>
          {pagination.pageItems.map((customer) => (
            <tr key={customer.id} className="hover:bg-muted/30">
              <AdminTd>
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">{customer.id}</p>
                </div>
              </AdminTd>
              <AdminTd className="break-all">{customer.email}</AdminTd>
              <AdminTd className="font-mono text-xs">{customer.phone}</AdminTd>
              <AdminTd>
                <p>{customer.city}</p>
                <p className="text-xs text-muted-foreground">{customer.area}</p>
              </AdminTd>
              <AdminTd className="font-medium">{customer.orderCount}</AdminTd>
              <AdminTd className="text-right font-medium">
                {formatBdt(customer.totalSpentBdt)}
              </AdminTd>
              <AdminTd>
                {new Date(customer.createdAt).toLocaleDateString()}
              </AdminTd>
              <AdminTd className="text-right">
                <AdminDeleteTrigger
                  itemLabel={`the customer “${customer.name}”`}
                  title="Delete customer?"
                  description={`Are you sure you want to delete “${customer.name}”? This removes it from the list.`}
                  buttonLabel="Delete"
                  buttonVariant="destructive"
                  onConfirm={() => {
                    setRows((current) =>
                      current.filter((row) => row.id !== customer.id),
                    );
                    setStatus(
                      `“${customer.name}” was removed.`,
                    );
                  }}
                />
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      <AdminPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
