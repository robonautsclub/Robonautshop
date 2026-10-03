import type { ReactNode } from "react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";

type AuthFormShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthFormShell({
  title,
  description,
  children,
  footer,
}: AuthFormShellProps) {
  return (
    <PageContainer as="section" className="py-10">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
        <div className="mt-8 rounded-xl border p-5 sm:p-6">{children}</div>
        {footer ? <div className="mt-4 text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </PageContainer>
  );
}

export function fieldClassName(hasError?: boolean) {
  return [
    "h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    hasError ? "border-destructive" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function AuthComingSoonNote() {
  return (
    <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      Auth submit is a UI shell only for now. Real sign-in and registration are
      wired in a later backend phase — this form will not create a session.
    </p>
  );
}

export function AuthSwitchLinks({ mode }: { mode: "login" | "register" }) {
  if (mode === "login") {
    return (
      <p>
        New here?{" "}
        <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    );
  }

  return (
    <p>
      Already have an account?{" "}
      <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
        Sign in
      </Link>
    </p>
  );
}
