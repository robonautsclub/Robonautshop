import { PolicyPage, policyMetadata } from "@/components/content/policy-page";

export const metadata = policyMetadata("returns");

export default function Page() {
  return <PolicyPage slug="returns" />;
}
