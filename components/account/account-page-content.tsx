"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AccountNav } from "@/components/account/account-nav";
import { useAuth } from "@/components/auth/auth-provider";
import { ProfileForm } from "@/components/account/profile-form";
import { ResendVerificationNotice } from "@/components/account/resend-verification-notice";
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
              Your Robonautsshop profile and order history.
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
        {user.emailVerified ? null : <ResendVerificationNotice email={user.email} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-xl border p-5">
          <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <ProfileForm initialName={user.name} initialPhone={user.phone ?? ""} />
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
