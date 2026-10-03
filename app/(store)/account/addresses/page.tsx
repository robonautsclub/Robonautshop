import type { Metadata } from "next";

import { AccountNav } from "@/components/account/account-nav";
import { AddressesPanel } from "@/components/auth/addresses-panel";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Addresses",
};

export default function AccountAddressesPage() {
  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Addresses</h1>
          <p className="mt-2 text-muted-foreground">
            Add shipping addresses with Bangladesh-friendly fields.
          </p>
        </div>
        <AccountNav pathname="/account/addresses" />
      </div>

      <AddressesPanel />
    </PageContainer>
  );
}
