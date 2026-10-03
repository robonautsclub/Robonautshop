import type { Metadata } from "next";
import Link from "next/link";

import { AccountNav } from "@/components/account/account-nav";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
          <p className="mt-2 text-muted-foreground">
            Account overview shell. Real customer profiles arrive when auth is
            connected.
          </p>
        </div>
        <AccountNav pathname="/account" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-xl border p-5">
          <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">Not signed in</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">—</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium">Customer</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">
            Signed-out shell. Use login or register to preview the auth forms.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/login" className={cn(buttonVariants())}>
              Sign in
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/account/addresses"
            className="block rounded-xl border p-5 hover:border-foreground/20"
          >
            <h2 className="font-medium tracking-tight">Addresses</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage Bangladesh shipping addresses (session UI only).
            </p>
          </Link>
          <div className="rounded-xl border border-dashed p-5">
            <h2 className="font-medium tracking-tight">Orders</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Order history comes in a later phase.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
