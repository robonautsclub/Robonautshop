"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Shared submit state for admin forms backed by real server actions
 * (tasks/phase-19-admin-catalog). Runs the action, keeps its error for the
 * form, and refreshes server data on success so tables show what D1 holds.
 */
export function useAdminSave() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function run<T extends ActionResult>(
    action: () => Promise<T>,
    successMessage?: string,
  ): Promise<T | null> {
    setPending(true);
    setError(null);
    try {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return result;
      }
      if (successMessage) setStatus(successMessage);
      router.refresh();
      return result;
    } catch (caught) {
      console.error("Admin save failed", caught);
      setError("Something went wrong. Please try again.");
      return null;
    } finally {
      setPending(false);
    }
  }

  return { pending, error, setError, status, setStatus, run };
}
