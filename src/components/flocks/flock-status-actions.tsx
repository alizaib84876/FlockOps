"use client";

import { useActionState, useState } from "react";
import { closeFlock, harvestFlock, type ActionState } from "@/lib/flocks/actions";

const initial: ActionState = {};

export function FlockStatusActions({ flockId }: { flockId: string }) {
  const harvest = harvestFlock.bind(null, flockId);
  const [state, action, pending] = useActionState(harvest, initial);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  async function onClose() {
    setClosing(true);
    setCloseError(null);
    const result = await closeFlock(flockId);
    setClosing(false);
    if (result.error) setCloseError(result.error);
  }

  return (
    <div className="space-y-4">
      <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm font-medium text-ink">
          Harvest date
          <input
            name="harvest_date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-full bg-sage-deep px-5 text-sm font-medium text-panel disabled:opacity-60"
        >
          {pending ? "Recording…" : "Mark harvested"}
        </button>
      </form>
      <button
        type="button"
        onClick={onClose}
        disabled={closing}
        className="h-12 rounded-full border border-line px-5 text-sm font-medium text-muted hover:text-ink disabled:opacity-60"
      >
        {closing ? "Closing…" : "Close flock without harvest"}
      </button>
      {state.error || closeError ? (
        <p className="text-sm text-copper" role="alert">
          {state.error || closeError}
        </p>
      ) : null}
    </div>
  );
}
