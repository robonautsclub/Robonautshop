import { AccountNav } from "@/components/account/account-nav";
import { AddressesPanel } from "@/components/auth/addresses-panel";
import { PageContainer } from "@/components/layout/page-container";
import { listAddressesForUser } from "@/lib/account/address-queries";
import { getServerSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";

export async function AccountAddressesContent() {
  const session = await getServerSession();
  const db = await getRequestDb();
  const addresses = session
    ? await listAddressesForUser(db, session.user.id)
    : [];

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Addresses</h1>
          <p className="mt-2 text-muted-foreground">
            Saved Bangladesh delivery addresses for checkout.
          </p>
        </div>
        <AccountNav pathname="/account/addresses" />
      </div>

      <AddressesPanel initialAddresses={addresses} />
    </PageContainer>
  );
}
