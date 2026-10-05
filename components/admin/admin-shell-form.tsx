"use client";

import { type FormEvent, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";

type AdminShellFormProps = {
  title: string;
  noun: string;
  children: React.ReactNode;
  submitLabel?: string;
};

export function AdminShellForm({
  title,
  noun,
  children,
  submitLabel = "Save",
}: AdminShellFormProps) {
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(`“${noun}” saved.`);
  }

  return (
    <section className="space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {children}
        <Button type="submit">{submitLabel}</Button>
        {message ? (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        ) : null}
      </form>
    </section>
  );
}

export function AdminField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

export { fieldClassName };
