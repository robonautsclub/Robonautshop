import { PolicyPage, policyMetadata } from "@/components/content/policy-page";

export const metadata = policyMetadata("shipping");

export default function Page() {
  return <PolicyPage slug="shipping" />;
}
