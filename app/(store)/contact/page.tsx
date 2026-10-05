import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/contact-form";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <PageContainer as="section" className="max-w-xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
        <p className="mt-2 text-muted-foreground">
          Questions about an order, a product, or a robot build? Send us a message.
        </p>
      </div>

      <ContactForm />
    </PageContainer>
  );
}
