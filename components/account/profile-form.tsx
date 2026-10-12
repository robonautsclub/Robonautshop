"use client";

import { type FormEvent, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { updateMyProfileAction } from "@/lib/account/profile-actions";
import { authClient } from "@/lib/auth/client";
import { profileSchema, type ProfileInput } from "@/lib/auth/schemas";

type Errors = Partial<Record<keyof ProfileInput | "form", string>>;

export function ProfileForm({
  initialName,
  initialPhone,
}: {
  initialName: string;
  initialPhone: string;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const formData = new FormData(event.currentTarget);
    const parsed = profileSchema.safeParse({
      name: formData.get("name"),
      phone: formData.get("phone") ?? "",
    });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name" || key === "phone") {
          next[key] ??= issue.message;
        }
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setPending(true);
    const result = await updateMyProfileAction(parsed.data);
    setPending(false);

    if (!result.ok) {
      setErrors({ ...result.fieldErrors, form: result.error });
      return;
    }
    // Refresh the cached session so the navbar and this page show the new name.
    authClient.$store.notify("$sessionSignal");
    setStatus("Profile saved.");
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
      <div className="space-y-1.5">
        <label htmlFor="profile-name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="profile-name"
          name="name"
          defaultValue={initialName}
          autoComplete="name"
          className={fieldClassName(Boolean(errors.name))}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="profile-phone" className="text-sm font-medium">
          Mobile number
        </label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="01XXXXXXXXX"
          defaultValue={initialPhone}
          autoComplete="tel"
          className={fieldClassName(Boolean(errors.phone))}
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone ? <p className="text-sm text-destructive">{errors.phone}</p> : null}
      </div>
      {errors.form && !errors.name && !errors.phone ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.form}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}
