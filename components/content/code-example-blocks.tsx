import type { CodeExample } from "@/lib/content";

type CodeExampleBlocksProps = {
  examples: CodeExample[];
  heading?: string;
};

export function CodeExampleBlocks({
  examples,
  heading = "Code examples",
}: CodeExampleBlocksProps) {
  if (examples.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Starter sketches for wiring checks — adapt pin numbers to your board.
      </p>
      <ul className="mt-4 space-y-4">
        {examples.map((example) => (
          <li key={example.id} className="overflow-hidden rounded-xl border">
            <div className="border-b bg-muted/40 px-4 py-3">
              <p className="font-medium tracking-tight">{example.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {example.description}
                <span className="ml-2 text-xs uppercase tracking-wide">
                  {example.language}
                </span>
              </p>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
              <code>{example.code}</code>
            </pre>
          </li>
        ))}
      </ul>
    </section>
  );
}
