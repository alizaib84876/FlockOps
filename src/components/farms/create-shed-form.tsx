"use client";

import { useActionState } from "react";
import { createShed, type ActionState } from "@/lib/farms/actions";

const initial: ActionState = {};

export function CreateShedForm({ farmId }: { farmId: string }) {
  const action = createShed.bind(null, farmId);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_140px_auto] sm:items-end">
      <label className="block text-sm font-medium text-ink">
        Shed name
        <input
          name="name"
          required
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
          placeholder="Shed 1"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Capacity
        <input
          name="capacity"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={1}
          step={1}
          required
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
          placeholder="15000"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-sage-deep px-5 text-sm font-medium text-panel disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add shed"}
      </button>
      {state.error ? (
        <p className="text-sm text-copper sm:col-span-3" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
