"use client";

import { useActionState, useMemo, useState } from "react";
import { updateSale, type ActionState } from "@/lib/finance/actions";
import type { Sale } from "@/lib/finance/types";
import type { FlockWithSite } from "@/lib/flocks/types";

const initial: ActionState = {};
const fieldClass =
  "mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4";

export function EditSaleForm({
  sale,
  flocks,
}: {
  sale: Sale;
  flocks: FlockWithSite[];
}) {
  const options = useMemo(() => {
    const active = flocks.filter((flock) => flock.status === "ACTIVE");
    const current = flocks.find((flock) => flock.id === sale.flock_id);
    if (current && !active.some((flock) => flock.id === current.id)) {
      return [current, ...active];
    }
    return active;
  }, [flocks, sale.flock_id]);

  const [state, action, pending] = useActionState(updateSale, initial);
  const [emptyWeight, setEmptyWeight] = useState(
    sale.empty_weight_kg !== null ? String(sale.empty_weight_kg) : "",
  );
  const [loadedWeight, setLoadedWeight] = useState(
    sale.loaded_weight_kg !== null ? String(sale.loaded_weight_kg) : "",
  );

  const empty = Number(emptyWeight);
  const loaded = Number(loadedWeight);
  const netWeight =
    emptyWeight !== "" &&
    loadedWeight !== "" &&
    !Number.isNaN(empty) &&
    !Number.isNaN(loaded)
      ? loaded - empty
      : null;

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="sale_id" value={sale.id} />
      <label className="block text-sm font-medium text-ink sm:col-span-2">
        Flock
        <select
          name="flock_id"
          required
          defaultValue={sale.flock_id}
          className={fieldClass}
        >
          {options.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.flock_number} · {flock.farm_name} · {flock.shed_name}
              {flock.status !== "ACTIVE" ? " · harvested" : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-ink">
        Sale date
        <input
          name="sale_date"
          type="date"
          required
          defaultValue={sale.sale_date}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Buyer
        <input
          name="buyer_name"
          required
          defaultValue={sale.buyer_name}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Empty vehicle (kg)
        <input
          name="empty_weight_kg"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          required
          value={emptyWeight}
          onChange={(event) => setEmptyWeight(event.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Vehicle with chickens (kg)
        <input
          name="loaded_weight_kg"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          required
          value={loadedWeight}
          onChange={(event) => setLoadedWeight(event.target.value)}
          className={fieldClass}
        />
      </label>
      <div className="rounded-xl border border-line bg-background px-4 py-3 sm:col-span-2">
        <p className="text-xs text-muted">Net chicken weight</p>
        <p className="mt-1 text-lg font-semibold text-ink">
          {netWeight === null
            ? "—"
            : netWeight <= 0
              ? "Loaded weight must be greater than empty weight"
              : `${netWeight.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg`}
        </p>
      </div>
      <label className="block text-sm font-medium text-ink">
        Price per kg
        <input
          name="price_per_kg"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          required
          defaultValue={sale.price_per_kg}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Driver name
        <input
          name="driver_name"
          defaultValue={sale.driver_name ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-medium text-ink sm:col-span-2">
        Notes
        <textarea
          name="notes"
          rows={3}
          defaultValue={sale.notes ?? ""}
          className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink sm:col-span-2">
        Reason for change
        <input
          name="reason"
          required
          className={fieldClass}
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
        className="h-12 rounded-full bg-sage-deep px-5 text-sm font-medium text-panel disabled:opacity-60 sm:col-span-2"
      >
        {pending ? "Saving…" : "Save correction"}
      </button>
    </form>
  );
}
