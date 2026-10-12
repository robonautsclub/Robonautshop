import { PolicyPage, policyMetadata } from "@/components/content/policy-page";

export const metadata = policyMetadata("faq");

export default function Page() {
  return <PolicyPage slug="faq" />;
}
