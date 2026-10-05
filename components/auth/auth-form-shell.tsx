import type { ReactNode } from "react";
import Link from "next/link";
import { XIcon } from "lucide-react";

import { SiteLogo } from "@/components/brand/site-logo";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

type AuthFormShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  /** When set, shows a top-right close control that navigates here (e.g. "/"). */
  closeHref?: string;
};

export function AuthFormShell({
  title,
  description,
  children,
  footer,
  closeHref,
}: AuthFormShellProps) {
  return (
    <PageContainer as="section" className="relative py-10">
      {closeHref ? (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-8 sm:right-12 lg:right-20 xl:right-28"
          aria-label="Close and go to home"
          nativeButton={false}
          render={<Link href={closeHref} />}
        >
          <XIcon className="size-5" />
        </Button>
      ) : null}
      <div className="mx-auto w-full max-w-md">
        <SiteLogo href="/" size="sm" className="mb-6" />
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

/** Customer-only: switches between /user/login and /register. Never used on the admin /login page. */
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
      <Link href="/user/login" className="font-medium text-foreground underline-offset-4 hover:underline">
        Sign in
      </Link>
    </p>
  );
}
