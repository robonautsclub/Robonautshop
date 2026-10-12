import type { Metadata } from "next";
import Link from "next/link";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Verify email",
};

type VerifyEmailPageProps = {
  searchParams: Promise<{ error?: string }>;
};

/** Landing page for Better Auth's verification link (redirects here with ?error= on failure). */
export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { error } = await searchParams;

  return (
    <AuthFormShell
      title={error ? "Link not valid" : "Email verified"}
      description={
        error
          ? "This verification link is invalid or has expired."
          : "Thanks — your email address is confirmed. You can now place orders."
      }
    >
      <Link
        href={error ? "/account" : "/"}
        className={cn(buttonVariants(), "w-full")}
      >
        {error ? "Go to account to resend" : "Continue shopping"}
      </Link>
    </AuthFormShell>
  );
}
