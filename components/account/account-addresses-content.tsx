"use client";

import Link from "next/link";

import { AccountNav } from "@/components/account/account-nav";
import { AddressesPanel } from "@/components/auth/addresses-panel";
import { useAuth } from "@/components/auth/auth-provider";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccountAddressesContent() {
  const { hydrated, isSignedIn } = useAuth();

  if (!hydrated) {
    return (
      <PageContainer as="section" className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Addresses</h1>
        <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
      </PageContainer>
    );
  }

  if (!isSignedIn) {
    return (
      <PageContainer as="section" className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Addresses</h1>
        <p className="mt-2 text-muted-foreground">Not signed in.</p>
        <Link href="/login" className={cn(buttonVariants(), "mt-6 inline-flex")}>
          Sign in
        </Link>
      </PageContainer>
    );
  }

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
