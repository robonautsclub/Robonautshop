export function AdminShellNote() {
  return (
    <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      Admin UI shell only — no real ADMIN auth yet. Data is mock/static fixture
      data. Saves do not persist. Real protection comes in a later phase.
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
