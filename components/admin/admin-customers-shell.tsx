"use client";

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

export function AdminCustomersShell({
  customers,
}: {
  customers: AdminCustomer[];
}) {
  const pagination = useAdminPagination(customers, 20);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description={`${customers.length} demo customers · no real user admin actions.`}
        toolbar={
          <>
            <AdminTableToolbarSearch placeholder="Search customers (demo)" />
            <p className="text-xs text-muted-foreground">
              Static fixture rows only
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
          <AdminTh>Joined</AdminTh>
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
              <AdminTd>{customer.city}</AdminTd>
              <AdminTd className="font-medium">{customer.orderCount}</AdminTd>
              <AdminTd>
                {new Date(customer.createdAt).toLocaleDateString()}
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
    </div>
  );
}
