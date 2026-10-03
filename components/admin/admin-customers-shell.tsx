import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
          {customers.map((customer) => (
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
    </div>
  );
}
