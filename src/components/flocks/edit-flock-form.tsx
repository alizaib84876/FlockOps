"use client";

import { useActionState } from "react";
import { updateFlock, type ActionState } from "@/lib/flocks/actions";
import type { FlockWithSite } from "@/lib/flocks/types";

const initial: ActionState = {};

export function EditFlockForm({ flock }: { flock: FlockWithSite }) {
  const action = updateFlock.bind(null, flock.id);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium text-ink">
        Flock number
        <input
          name="flock_number"
          required
          defaultValue={flock.flock_number}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Breed
        <input
          name="breed"
          defaultValue={flock.breed ?? ""}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink sm:col-span-2">
        Cost per chick
        <input
          name="cost_per_chick"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          defaultValue={flock.cost_per_chick}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-copper sm:col-span-2" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full border border-line bg-panel px-5 text-sm font-medium text-ink disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save flock details"}
      </button>
    </form>
  );
}
