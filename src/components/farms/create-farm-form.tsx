"use client";

import { useActionState } from "react";
import { createFarm, type ActionState } from "@/lib/farms/actions";

const initial: ActionState = {};

export function CreateFarmForm() {
  const [state, action, pending] = useActionState(createFarm, initial);

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium text-ink">
        Farm name
        <input
          name="name"
          required
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
          placeholder="North site"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Location
        <input
          name="location"
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
          placeholder="Sheikhupura"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-copper" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-sage-deep px-5 text-sm font-medium text-panel disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add farm"}
      </button>
    </form>
  );
}
