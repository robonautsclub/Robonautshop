import Link from "next/link";

import { AskQuestionForm } from "@/components/questions/ask-question-form";
import type { PublicQuestion } from "@/lib/questions/queries";

type ProductQuestionsSectionProps = {
  productSlug: string;
  questions: PublicQuestion[];
  isSignedIn: boolean;
};

/** Answered Q&A list (server-rendered; text is escaped by React) plus the ask form. */
export function ProductQuestionsSection({
  productSlug,
  questions,
  isSignedIn,
}: ProductQuestionsSectionProps) {
  return (
    <section className="mt-14" aria-labelledby="questions-heading">
      <h2 id="questions-heading" className="text-xl font-semibold tracking-tight">
        Questions &amp; answers
      </h2>

      {questions.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No questions answered yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {questions.map((item) => (
            <li key={item.id} className="rounded-xl border p-4">
              <p className="whitespace-pre-wrap text-sm font-medium">Q: {item.question}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                A: {item.answer}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Asked by {item.askedBy} · {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        {isSignedIn ? (
          <AskQuestionForm productSlug={productSlug} />
        ) : (
          <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
            <Link href="/user/login" className="font-medium underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            to ask a question.
          </p>
        )}
      </div>
    </section>
  );
}
