"use client";

import { RouteError } from "@/components/shared/route-error";

type StoreErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function StoreError({ reset }: StoreErrorProps) {
  return (
    <RouteError reset={reset} homeHref="/" homeLabel="Go home" />
  );
}
