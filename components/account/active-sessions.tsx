"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { describeUserAgent } from "@/lib/account/user-agent";
import { authClient } from "@/lib/auth/client";

type SessionRow = {
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  updatedAt: Date;
};

/** Better Auth session APIs only — no custom session table (task 132). */
export function ActiveSessions() {
  const { data: current } = authClient.useSession();
  const currentToken = current?.session.token;
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void authClient.listSessions().then(({ data, error: listError }) => {
      if (cancelled) return;
      if (listError || !data) {
        console.error("[auth] listSessions failed:", listError);
        setError("Could not load your sessions.");
        return;
      }
      setError(null);
      setSessions(data as SessionRow[]);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function run(action: () => Promise<{ error: unknown }>) {
    setBusy(true);
    const { error: actionError } = await action();
    if (actionError) {
      console.error("[auth] session revoke failed:", actionError);
      setError("Could not sign out that session. Please try again.");
    }
    setRefreshKey((key) => key + 1);
    setBusy(false);
  }

  const others = sessions?.filter((row) => row.token !== currentToken) ?? [];

  return (
    <div className="rounded-xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Active sessions</h2>
        {others.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => run(() => authClient.revokeOtherSessions())}
          >
            Sign out all other devices
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {sessions === null && !error ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading sessions…</p>
      ) : null}

      <ul className="mt-3 divide-y text-sm">
        {sessions?.map((row) => {
          const isCurrent = row.token === currentToken;
          return (
            <li key={row.token} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">
                  {describeUserAgent(row.userAgent)}
                  {isCurrent ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      This device
                    </span>
                  ) : null}
                </p>
                <p className="text-muted-foreground">
                  {row.ipAddress ? `${row.ipAddress} · ` : ""}
                  Last active {new Date(row.updatedAt).toLocaleString()}
                </p>
              </div>
              {isCurrent ? null : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => run(() => authClient.revokeSession({ token: row.token }))}
                >
                  Sign out
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
