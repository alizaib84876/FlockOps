"use client";

import { useActionState, useMemo, useState } from "react";
import { updateExpense, type ActionState } from "@/lib/finance/actions";
import {
  categoryLabel,
  EXPENSE_CATEGORIES,
  type Expense,
} from "@/lib/finance/types";
import type { FarmWithSheds } from "@/lib/farms/types";
import type { FlockWithSite } from "@/lib/flocks/types";

const initial: ActionState = {};

export function EditExpenseForm({
  expense,
  farms,
  flocks,
}: {
  expense: Expense;
  farms: FarmWithSheds[];
  flocks: FlockWithSite[];
}) {
  const activeFarms = farms.filter((farm) => !farm.archived);
  const [farmId, setFarmId] = useState(expense.farm_id);
  const farmFlocks = useMemo(
    () =>
      flocks.filter(
        (flock) =>
          flock.farm_id === farmId &&
          (flock.status === "ACTIVE" || flock.id === expense.flock_id),
      ),
    [expense.flock_id, farmId, flocks],
  );
  const [state, action, pending] = useActionState(updateExpense, initial);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="expense_id" value={expense.id} />
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
          defaultValue={expense.farm_id === farmId ? (expense.flock_id ?? "") : ""}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        >
          <option value="">Farm overhead</option>
          {farmFlocks.map((flock) => (
            <option key={flock.id} value={flock.id}>
              {flock.flock_number} · {flock.shed_name}
              {flock.status !== "ACTIVE" ? " · harvested" : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-ink">
        Category
        <select
          name="category"
          required
          defaultValue={expense.category}
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
          defaultValue={expense.amount}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Date
        <input
          name="expense_date"
          type="date"
          required
          defaultValue={expense.expense_date}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Receipt URL
        <input
          name="receipt_url"
          type="url"
          defaultValue={expense.receipt_url ?? ""}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink sm:col-span-2">
        Description
        <input
          name="description"
          required
          defaultValue={expense.description}
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink sm:col-span-2">
        Reason for change
        <input
          name="reason"
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
        disabled={pending}
        className="h-12 rounded-full bg-sage-deep px-5 text-sm font-medium text-panel disabled:opacity-60 sm:col-span-2"
      >
        {pending ? "Saving…" : "Save correction"}
      </button>
    </form>
  );
}
