"use client";

import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { StatusPage } from "@/components/shared/status-page";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RouteErrorProps = {
  reset: () => void;
  homeHref: string;
  homeLabel: string;
};

export function RouteError({ reset, homeHref, homeLabel }: RouteErrorProps) {
  return (
    <PageContainer as="section" className="py-16 sm:py-24">
      <StatusPage
        title="Something went wrong"
        description="Please try again. If the problem continues, go back and open the page from the menu."
      >
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link
          href={homeHref}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          {homeLabel}
        </Link>
      </StatusPage>
    </PageContainer>
  );
}
