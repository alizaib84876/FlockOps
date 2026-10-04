"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setHasSession(Boolean(data.user));
    });
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
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
    if (updateError) {
      setPending(false);
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    setPending(false);
    setDone(true);
  }

  if (done) {
    return (
      <>
        <h1 className="display mt-6 text-3xl text-ink">Password updated</h1>
        <p className="mt-3 text-sm leading-6 text-muted" role="status">
          Sign in with your new password.
        </p>
        <Link
          href="/login"
          className="mt-8 flex h-12 items-center justify-center rounded-full bg-sage-deep text-sm font-medium text-panel"
        >
          Sign in
        </Link>
      </>
    );
  }

  if (hasSession === false) {
    return (
      <>
        <h1 className="display mt-6 text-3xl text-ink">New password</h1>
        <p className="mt-8 text-sm text-muted">
          Open the reset link from your email, or{" "}
          <Link href="/forgot-password" className="font-medium text-ink hover:underline">
            request a new one
          </Link>
          .
        </p>
      </>
    );
  }

  if (hasSession === null) {
    return (
      <>
        <h1 className="display mt-6 text-3xl text-ink">New password</h1>
        <p className="mt-8 text-sm text-muted">Loading…</p>
      </>
    );
  }

  return (
    <>
      <h1 className="display mt-6 text-3xl text-ink">New password</h1>
    <form className="mt-8 space-y-4" onSubmit={onSubmit} aria-label="Set new password">
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
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full bg-sage-deep text-sm font-medium text-panel disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
    </>
  );
}
