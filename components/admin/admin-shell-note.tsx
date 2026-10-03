export function AdminShellNote({
  compact = false,
}: {
  compact?: boolean;
}) {
  if (compact) {
    return (
      <p className="text-xs text-muted-foreground">
        UI shell only · mock data · saves do not persist
      </p>
    );
  }

  return (
    <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      Admin UI shell only — no real ADMIN auth yet. Data is mock/static. Saves do
      not persist.
    </p>
  );
}

export function AdminFormNote({ noun = "record" }: { noun?: string }) {
  return (
    <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      Form shell only. Submitting will not create or update a {noun}.
    </p>
  );
}
