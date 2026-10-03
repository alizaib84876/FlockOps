"use client";

import { useActionState } from "react";
import { updateFarm, type ActionState } from "@/lib/farms/actions";

const initial: ActionState = {};

export function EditFarmForm({
  farmId,
  name,
  location,
}: {
  farmId: string;
  name: string;
  location: string | null;
}) {
  const action = updateFarm.bind(null, farmId);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm font-medium text-ink">
        Farm name
        <input
          name="name"
          required
          defaultValue={name}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Location
        <input
          name="location"
          defaultValue={location ?? ""}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
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
        className="h-12 rounded-full border border-line bg-panel px-5 text-sm font-medium text-ink disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save farm details"}
      </button>
    </form>
  );
}
