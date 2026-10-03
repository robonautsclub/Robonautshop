import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminTable,
  AdminTableHead,
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
    <div>
      <AdminPageHeader
        title="Customers"
        description="Static demo customer rows. No real user admin actions."
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
        <tbody className="divide-y">
          {customers.map((customer) => (
            <tr key={customer.id}>
              <AdminTd>
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">{customer.id}</p>
                </div>
              </AdminTd>
              <AdminTd>{customer.email}</AdminTd>
              <AdminTd className="font-mono text-xs">{customer.phone}</AdminTd>
              <AdminTd>{customer.city}</AdminTd>
              <AdminTd>{customer.orderCount}</AdminTd>
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
