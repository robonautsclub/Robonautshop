import { PolicyPage, policyMetadata } from "@/components/content/policy-page";

export const metadata = policyMetadata("about");

export default function Page() {
  return <PolicyPage slug="about" />;
}
