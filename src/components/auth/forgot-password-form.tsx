"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/update-password`,
    });

    setPending(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("If that email is registered, a reset link is on its way.");
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit} aria-label="Reset password">
      <label className="block text-sm font-medium text-ink">
        Work email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
          placeholder="you@company.com"
        />
      </label>
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
        className="h-12 w-full rounded-full bg-sage-deep text-sm font-medium text-panel disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-ink hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
