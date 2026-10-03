import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EditExpenseForm } from "@/components/finance/edit-expense-form";
import { FinanceAuditList } from "@/components/finance/finance-audit-list";
import { requireProfile } from "@/lib/auth/require-profile";
import { listFarms } from "@/lib/farms/queries";
import { canSeeFinance } from "@/lib/finance/types";
import { getExpense, listExpenseEdits } from "@/lib/finance/queries";
import { listFlocks } from "@/lib/flocks/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ expenseId: string }>;
}): Promise<Metadata> {
  const { expenseId } = await params;
  const expense = await getExpense(expenseId);
  return { title: expense ? "Correct expense" : "Expense" };
}

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ expenseId: string }>;
}) {
  const profile = await requireProfile();
  if (!canSeeFinance(profile.role)) redirect("/app");

  const { expenseId } = await params;
  const [expense, farms, flocks, edits] = await Promise.all([
    getExpense(expenseId),
    listFarms(),
    listFlocks(),
    listExpenseEdits(expenseId).catch(() => []),
  ]);
  if (!expense) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/app/expenses" className="text-sm text-muted hover:text-ink">
          ← Expenses
        </Link>
        <h1 className="display mt-3 text-4xl text-ink">Correct expense</h1>
      </div>
      <section className="rounded-2xl border border-line bg-panel p-6">
        <EditExpenseForm expense={expense} farms={farms} flocks={flocks} />
      </section>
      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Audit trail</h2>
        <FinanceAuditList edits={edits} />
      </section>
    </div>
  );
}
