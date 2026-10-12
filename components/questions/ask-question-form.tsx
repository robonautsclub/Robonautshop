"use client";

import { type FormEvent, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { askQuestionAction } from "@/lib/questions/actions";
import { askQuestionSchema } from "@/lib/questions/schemas";

export function AskQuestionForm({ productSlug }: { productSlug: string }) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const parsed = askQuestionSchema.safeParse({
      question: new FormData(form).get("question"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid question.");
      return;
    }

    setPending(true);
    const result = await askQuestionAction(productSlug, parsed.data);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    form.reset();
    setSent(true);
  }

  return (
    <form className="space-y-3 rounded-xl border p-4" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="ask-question" className="text-sm font-medium">
          Ask a question about this product
        </label>
        <textarea
          id="ask-question"
          name="question"
          rows={3}
          maxLength={500}
          className={`${fieldClassName(Boolean(error))} min-h-20 py-2`}
          aria-invalid={Boolean(error)}
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {sent ? (
        <p className="text-sm text-muted-foreground" role="status">
          Thanks! Your question will appear here once our team has answered it.
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Ask question"}
      </Button>
    </form>
  );
}
