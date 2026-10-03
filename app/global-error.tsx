"use client";

import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center gap-4 px-8 py-16">
          <h1 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            A critical error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
