"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { createClient } from "@/lib/supabase/client";

export function PasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    form.reset();
    setMessage("Password updated.");
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <PasswordInput
        name="password"
        label="New password"
        autoComplete="new-password"
        minLength={8}
      />
      <PasswordInput
        name="confirm"
        label="Confirm password"
        autoComplete="new-password"
        minLength={8}
      />
      {error ? (
        <p className="text-sm text-copper" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-sage" role="status">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-sage-deep px-5 text-sm font-medium text-panel disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
