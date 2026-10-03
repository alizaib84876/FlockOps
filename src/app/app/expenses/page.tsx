import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateExpenseForm } from "@/components/finance/create-expense-form";
import { CreateSaleForm } from "@/components/finance/create-sale-form";
import { requireProfile } from "@/lib/auth/require-profile";
import { listFarms } from "@/lib/farms/queries";
import {
  canSeeFinance,
  canSeeProfit,
  categoryLabel,
} from "@/lib/finance/types";
import { listExpenses, listSales } from "@/lib/finance/queries";
import { listFlocks } from "@/lib/flocks/queries";

export const metadata = {
  title: "Expenses",
};

function money(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function ExpensesPage() {
  const profile = await requireProfile();
  if (!canSeeFinance(profile.role)) {
    redirect("/app");
  }

  const showProfit = canSeeProfit(profile.role);
  const [farms, flocks, expenses, sales] = await Promise.all([
    listFarms(),
    listFlocks(),
    listExpenses(),
    showProfit ? listSales() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
          Finance
        </p>
        <h1 className="display mt-2 text-4xl text-ink">Expenses</h1>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold text-ink">Add an expense</h2>
        <div className="mt-5">
          <CreateExpenseForm farms={farms} flocks={flocks} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-ink">Ledger</h2>
        {expenses.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-panel px-5 py-8 text-sm text-muted">
            No expenses yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-panel">
            {expenses.map((expense) => (
              <li key={expense.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-ink">
                    {categoryLabel(expense.category)} · {money(expense.amount)}
                  </p>
                  <p className="text-sm text-muted">
                    {expense.expense_date} · {expense.farm_name} ·{" "}
                    {expense.flock_number
                      ? expense.flock_number
                      : "Farm overhead"}
                  </p>
                  <p className="mt-1 text-sm text-ink">{expense.description}</p>
                </div>
                <Link
                  href={`/app/expenses/${expense.id}`}
                  className="text-sm font-medium text-sage hover:text-sage-deep"
                >
                  Correct
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showProfit ? (
        <>
          <section className="rounded-2xl border border-line bg-panel p-6">
            <h2 className="text-lg font-semibold text-ink">Record a sale</h2>
            <div className="mt-5">
              <CreateSaleForm flocks={flocks} />
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">Sales</h2>
            {sales.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No sales yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-panel">
                {sales.map((sale) => (
                  <li key={sale.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 text-sm">
                    <div>
                    <p className="font-medium text-ink">
                      {sale.flock_number} · {money(sale.total_amount)}
                    </p>
                    <p className="text-muted">
                      {sale.sale_date} · {sale.buyer_name} · {sale.total_weight_kg} kg
                      {sale.empty_weight_kg !== null && sale.loaded_weight_kg !== null
                        ? ` (${sale.loaded_weight_kg} − ${sale.empty_weight_kg})`
                        : ""}{" "}
                      @ {money(sale.price_per_kg)}/kg
                      {sale.driver_name ? ` · Driver ${sale.driver_name}` : ""}
                    </p>
                    {sale.notes ? (
                      <p className="mt-1 text-ink">{sale.notes}</p>
                    ) : null}
                    </div>
                    <Link
                      href={`/app/sales/${sale.id}`}
                      className="text-sm font-medium text-sage hover:text-sage-deep"
                    >
                      Correct
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
