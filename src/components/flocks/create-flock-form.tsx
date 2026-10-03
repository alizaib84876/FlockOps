"use client";

import { useActionState, useMemo, useState } from "react";
import { createFlock, type ActionState } from "@/lib/flocks/actions";

const initial: ActionState = {};

export type ShedChoice = {
  id: string;
  name: string;
  capacity: number;
  farmId: string;
  farmName: string;
  occupied: boolean;
};

export function CreateFlockForm({
  sheds,
  suggestedNumber,
}: {
  sheds: ShedChoice[];
  suggestedNumber: string;
}) {
  const farms = useMemo(() => {
    const map = new Map<string, string>();
    for (const shed of sheds) {
      map.set(shed.farmId, shed.farmName);
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [sheds]);

  const [farmId, setFarmId] = useState(farms[0]?.id ?? "");
  const farmSheds = sheds.filter((shed) => shed.farmId === farmId);
  const [state, action, pending] = useActionState(createFlock, initial);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium text-ink">
        Farm
        <select
          value={farmId}
          onChange={(event) => setFarmId(event.target.value)}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        >
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-ink">
        Shed
        <select
          key={farmId}
          name="shed_id"
          required
          defaultValue=""
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        >
          <option value="" disabled>
            Select a shed
          </option>
          {farmSheds.map((shed) => (
            <option key={shed.id} value={shed.id} disabled={shed.occupied}>
              {shed.name} · {shed.capacity.toLocaleString()} birds
              {shed.occupied ? " · occupied" : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-ink">
        Flock number
        <input
          name="flock_number"
          required
          defaultValue={suggestedNumber}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Placement date
        <input
          name="placement_date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Initial birds
        <input
          name="initial_birds"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={1}
          step={1}
          required
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Breed
        <input
          name="breed"
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
          placeholder="Cobb 500"
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
          defaultValue={0}
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
        disabled={pending || farmSheds.length === 0}
        className="h-12 rounded-full bg-sage-deep px-5 text-sm font-medium text-panel disabled:opacity-60 sm:col-span-2"
      >
        {pending ? "Placing flock…" : "Place flock"}
      </button>
    </form>
  );
}
