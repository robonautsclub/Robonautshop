import type { Metadata } from "next";

import { AccountAddressesContent } from "@/components/account/account-addresses-content";

export const metadata: Metadata = {
  title: "Addresses",
};

export default function AccountAddressesPage() {
  return <AccountAddressesContent />;
}
