"use client";

import { RouteError } from "@/components/shared/route-error";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ reset }: AdminErrorProps) {
  return (
    <RouteError reset={reset} homeHref="/admin" homeLabel="Admin home" />
  );
}
