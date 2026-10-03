"use client";

import { useActionState } from "react";
import { updateShed, type ActionState } from "@/lib/farms/actions";
import type { Shed } from "@/lib/farms/types";

const initial: ActionState = {};

export function EditShedForm({ farmId, shed }: { farmId: string; shed: Shed }) {
  const action = updateShed.bind(null, farmId, shed.id);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form
      action={formAction}
      className="grid gap-3 border-t border-line py-4 sm:grid-cols-[1fr_120px_auto] sm:items-end"
    >
      <label className="block text-sm font-medium text-ink">
        Name
        <input
          name="name"
          required
          defaultValue={shed.name}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
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
          defaultValue={shed.capacity}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full border border-line bg-panel px-4 text-sm font-medium text-ink disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {state.error ? (
        <p className="text-sm text-copper sm:col-span-3" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
