"use client";

import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-table";
import { useAdminSave } from "@/components/admin/use-admin-save";
import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { answerQuestionAction, setQuestionHiddenAction } from "@/lib/questions/actions";
import type { AdminQuestion } from "@/lib/questions/queries";

const STATUS_TONE = { PENDING: "warning", ANSWERED: "success", HIDDEN: "neutral" } as const;

function QuestionRow({ item }: { item: AdminQuestion }) {
  const save = useAdminSave();
  const [answer, setAnswer] = useState(item.answer ?? "");

  return (
    <li className="space-y-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <a href={`/products/${item.productSlug}`} className="font-medium text-foreground hover:underline">
            {item.productName}
          </a>{" "}
          · {item.askedBy} · {new Date(item.createdAt).toLocaleDateString()}
        </p>
        <AdminStatusBadge tone={STATUS_TONE[item.status]}>{item.status}</AdminStatusBadge>
      </div>
      <p className="whitespace-pre-wrap text-sm font-medium">{item.question}</p>

      <div className="space-y-1.5">
        <label htmlFor={`answer-${item.id}`} className="text-xs font-medium">
          Answer
        </label>
        <textarea
          id={`answer-${item.id}`}
          rows={3}
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          className={`${fieldClassName()} min-h-20 py-2`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={save.pending}
          onClick={() => void save.run(() => answerQuestionAction(item.id, answer), "Answer published.")}
        >
          {item.status === "ANSWERED" ? "Update answer" : "Publish answer"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={save.pending}
          onClick={() =>
            void save.run(
              () => setQuestionHiddenAction(item.id, item.status !== "HIDDEN"),
              item.status === "HIDDEN" ? "Question restored." : "Question hidden.",
            )
          }
        >
          {item.status === "HIDDEN" ? "Unhide" : "Hide"}
        </Button>
      </div>
      {save.error ? (
        <p className="text-sm text-destructive" role="alert">
          {save.error}
        </p>
      ) : null}
      {save.status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {save.status}
        </p>
      ) : null}
    </li>
  );
}

export function AdminQuestionsShell({ questions }: { questions: AdminQuestion[] }) {
  const pending = questions.filter((item) => item.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Questions"
        description={`${questions.length} questions · ${pending} waiting for an answer. Only answered questions appear on product pages.`}
      />
      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No customer questions yet.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((item) => (
            <QuestionRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
