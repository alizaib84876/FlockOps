"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { createClient } from "@/lib/supabase/client";

export function PasswordForm({ email }: { email: string }) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const current = String(data.get("current_password") ?? "");
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (!current) {
      setError("Enter your current password.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password === current) {
      setError("Choose a password that is different from the current one.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });
    if (verifyError) {
      setPending(false);
      setError("Current password is incorrect.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setPending(false);
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut({ scope: "others" });
    form.reset();
    setPending(false);
    setMessage("Password updated. Other devices have been signed out.");
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <PasswordInput
        name="current_password"
        label="Current password"
        autoComplete="current-password"
      />
      <PasswordInput
        name="password"
        label="New password"
        autoComplete="new-password"
        minLength={8}
      />
      <PasswordInput
        name="confirm"
        label="Confirm new password"
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
