"use client";

import Link from "next/link";
import { useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { createClient } from "@/lib/supabase/client";
import type { InvitePreview } from "@/lib/team/types";
import { roleLabel } from "@/lib/auth/profile";

export function SignupForm({
  inviteToken,
  invite,
}: {
  inviteToken?: string;
  invite?: InvitePreview | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isInvite = Boolean(inviteToken && invite && !invite.expired && !invite.accepted);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const organizationName = String(form.get("organization_name") ?? "").trim();
    const fullName = String(form.get("full_name") ?? "").trim();
    const phoneNumber = String(form.get("phone_number") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password !== confirm) {
      setPending(false);
      setError("Passwords do not match.");
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: isInvite
          ? {
              full_name: fullName,
              phone_number: phoneNumber,
              invite_token: inviteToken,
            }
          : {
              full_name: fullName,
              phone_number: phoneNumber,
              organization_name: organizationName,
            },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/login`,
      },
    });

    if (signUpError) {
      setPending(false);
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      await supabase.auth.signOut();
    }

    setPending(false);
    setMessage(
      data.session
        ? isInvite
          ? "Account created. Sign in to continue."
          : "Workspace created. Sign in to continue."
        : "Check your email to confirm the account, then sign in.",
    );
  }

  if (message) {
    return (
      <div className="mt-8 space-y-4">
        <p className="text-sm text-sage" role="status">
          {message}
        </p>
        <Link
          href="/login"
          className="flex h-12 items-center justify-center rounded-full bg-sage-deep text-sm font-medium text-panel"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit} aria-label="Create workspace">
      {isInvite ? (
        <p className="rounded-xl border border-line bg-background px-4 py-3 text-sm text-muted">
          {invite?.organization_name} · {invite ? roleLabel(invite.invite_role) : "Team"}
        </p>
      ) : (
        <label className="block text-sm font-medium text-ink">
          Company name
          <input
            name="organization_name"
            required
            className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
            placeholder="North Valley Poultry"
          />
        </label>
      )}
      <label className="block text-sm font-medium text-ink">
        Your name
        <input
          name="full_name"
          required
          defaultValue={invite?.full_name ?? ""}
          autoComplete="name"
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Phone
        <input
          name="phone_number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
          placeholder="0300 1234567"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Work email
        <input
          name="email"
          type="email"
          required
          defaultValue={invite?.email ?? ""}
          readOnly={isInvite}
          autoComplete="email"
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <PasswordInput
        name="password"
        label="Password"
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
        disabled={pending || Boolean(inviteToken && !isInvite)}
        className="h-12 w-full rounded-full bg-sage-deep text-sm font-medium text-panel disabled:opacity-60"
      >
        {pending
          ? "Saving…"
          : isInvite
            ? "Join workspace"
            : "Create workspace"}
      </button>
      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-ink hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
