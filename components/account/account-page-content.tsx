"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AccountNav } from "@/components/account/account-nav";
import { useAuth } from "@/components/auth/auth-provider";
import { PageContainer } from "@/components/layout/page-container";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccountPageContent() {
  const router = useRouter();
  const { hydrated, user, isSignedIn, signOut } = useAuth();

  if (!hydrated) {
    return (
      <PageContainer as="section" className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Loading profile…</p>
      </PageContainer>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <PageContainer as="section" className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
        <p className="mt-2 text-muted-foreground">Not signed in.</p>
        <Link href="/user/login" className={cn(buttonVariants(), "mt-6 inline-flex")}>
          Sign in
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
            <p className="mt-2 text-muted-foreground">
              Your Robonautshop profile and order history.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              signOut();
              router.push("/");
            }}
          >
            Sign out
          </Button>
        </div>
        <AccountNav pathname="/account" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-xl border p-5">
          <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-medium">Customer</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3">
          <Link
            href="/account/addresses"
            className="block rounded-xl border p-5 hover:border-foreground/20"
          >
            <h2 className="font-medium tracking-tight">Addresses</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage saved Bangladesh delivery addresses.
            </p>
          </Link>
          <Link
            href="/account/orders"
            className="block rounded-xl border p-5 hover:border-foreground/20"
          >
            <h2 className="font-medium tracking-tight">Orders</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              View order history and repay failed bKash attempts.
            </p>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
