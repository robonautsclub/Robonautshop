import { describe, expect, it } from "vitest";

import { estimateShippingBdt } from "@/lib/checkout/types";
import { getPolicyPage, POLICY_LINKS } from "@/lib/content/policy-pages";

describe("policy pages", () => {
  it("has a page for every footer link", () => {
    for (const link of POLICY_LINKS) {
      expect(getPolicyPage(link.href.slice(1) as never).path).toBe(link.href);
    }
  });

  it("quotes the same delivery charges the checkout uses and mentions no couriers", () => {
    const text = getPolicyPage("shipping")
      .sections.flatMap((section) => section.paragraphs)
      .join(" ");
    expect(text).toContain(String(estimateShippingBdt("Dhaka").amount));
    expect(text).toContain(String(estimateShippingBdt("Chattogram").amount));
    expect(text).not.toMatch(/pathao|steadfast|redx/i);
  });
});
