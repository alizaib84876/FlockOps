"use client";

import { useActionState } from "react";
import { updateProfile, type ActionState } from "@/lib/account/actions";

const initial: ActionState = {};

export function ProfileForm({
  fullName,
  phoneNumber,
}: {
  fullName: string;
  phoneNumber: string | null;
}) {
  const [state, action, pending] = useActionState(updateProfile, initial);

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium text-ink">
        Name
        <input
          name="full_name"
          required
          defaultValue={fullName}
          autoComplete="name"
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Phone
        <input
          name="phone_number"
          type="tel"
          defaultValue={phoneNumber ?? ""}
          autoComplete="tel"
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-copper" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-sage" role="status">
          Saved.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-sage-deep px-5 text-sm font-medium text-panel disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
