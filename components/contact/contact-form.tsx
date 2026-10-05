"use client";

import { type FormEvent, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { type ContactFormInput, contactFormSchema } from "@/lib/contact/schema";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<Record<keyof ContactFormInput | "form", string>>;

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const parsed = contactFormSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      // Honeypot — real visitors never see or fill this field.
      company: formData.get("company") || "",
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name" || key === "email" || key === "message") {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok || !result.ok) {
        setStatus("idle");
        setErrors({
          form: result.error ?? "Something went wrong. Please try again.",
          ...(result.fieldErrors as FieldErrors | undefined),
        });
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("idle");
      setErrors({ form: "Something went wrong. Please try again." });
    }
  }

  if (status === "success") {
    return (
      <p className="rounded-xl border p-4 text-sm text-muted-foreground" role="status">
        Thanks for reaching out — we&apos;ll get back to you soon.
      </p>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className="space-y-4 rounded-xl border p-4" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="contact-name" className="text-sm font-medium">
          Name
        </label>
        <input id="contact-name" name="name" className={fieldClassName(Boolean(errors.name))} />
        {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          className={fieldClassName(Boolean(errors.email))}
        />
        {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          className={cn(fieldClassName(Boolean(errors.message)), "min-h-28 resize-y")}
        />
        {errors.message ? <p className="text-sm text-destructive">{errors.message}</p> : null}
      </div>

      {/* Honeypot — hidden from real visitors via CSS, not `type="hidden"`, since
          some bots skip hidden inputs. Name is generic so form-fillers don't skip it. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {errors.form ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.form}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
