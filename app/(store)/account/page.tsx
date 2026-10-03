import type { Metadata } from "next";

import { AccountPageContent } from "@/components/account/account-page-content";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  return <AccountPageContent />;
}
