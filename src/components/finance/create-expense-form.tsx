"use client";

import { useActionState, useMemo, useState } from "react";
import { createExpense, type ActionState } from "@/lib/finance/actions";
import { categoryLabel, EXPENSE_CATEGORIES } from "@/lib/finance/types";
import { todayIsoDate } from "@/lib/logs/types";
import type { FarmWithSheds } from "@/lib/farms/types";
import type { FlockWithSite } from "@/lib/flocks/types";

const initial: ActionState = {};

export function CreateExpenseForm({
  farms,
  flocks,
}: {
  farms: FarmWithSheds[];
  flocks: FlockWithSite[];
}) {
  const activeFarms = farms.filter((farm) => !farm.archived);
  const [farmId, setFarmId] = useState(activeFarms[0]?.id ?? "");
  const farmFlocks = useMemo(
    () =>
      flocks.filter(
        (flock) => flock.farm_id === farmId && flock.status === "ACTIVE",
      ),
    [farmId, flocks],
  );
  const [state, action, pending] = useActionState(createExpense, initial);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium text-ink">
        Farm
        <select
          name="farm_id"
          required
          value={farmId}
          onChange={(event) => setFarmId(event.target.value)}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        >
          {activeFarms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-ink">
        Charge to
        <select
          key={farmId}
          name="flock_id"
          defaultValue=""
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        >
          <option value="">Farm overhead</option>
          {farmFlocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.flock_number} · {flock.shed_name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-ink">
        Category
        <select
          name="category"
          required
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        >
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {categoryLabel(category)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-ink">
        Amount
        <input
          name="amount"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          required
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Date
        <input
          name="expense_date"
          type="date"
          required
          defaultValue={todayIsoDate()}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Receipt URL
        <input
          name="receipt_url"
          type="url"
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink sm:col-span-2">
        Description
        <input
          name="description"
          required
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
        disabled={pending || activeFarms.length === 0}
        className="h-12 rounded-full bg-sage-deep px-5 text-sm font-medium text-panel disabled:opacity-60 sm:col-span-2"
      >
        {pending ? "Saving…" : "Add expense"}
      </button>
    </form>
  );
}
