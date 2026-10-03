import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EditSaleForm } from "@/components/finance/edit-sale-form";
import { FinanceAuditList } from "@/components/finance/finance-audit-list";
import { requireProfile } from "@/lib/auth/require-profile";
import { canSeeProfit } from "@/lib/finance/types";
import { getSale, listSaleEdits } from "@/lib/finance/queries";
import { listFlocks } from "@/lib/flocks/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ saleId: string }>;
}): Promise<Metadata> {
  const { saleId } = await params;
  const sale = await getSale(saleId);
  return { title: sale ? "Correct sale" : "Sale" };
}

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ saleId: string }>;
}) {
  const profile = await requireProfile();
  if (!canSeeProfit(profile.role)) redirect("/app/expenses");

  const { saleId } = await params;
  const [sale, flocks, edits] = await Promise.all([
    getSale(saleId),
    listFlocks(),
    listSaleEdits(saleId).catch(() => []),
  ]);
  if (!sale) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/app/expenses" className="text-sm text-muted hover:text-ink">
          ← Expenses
        </Link>
        <h1 className="display mt-3 text-4xl text-ink">Correct sale</h1>
      </div>
      <section className="rounded-2xl border border-line bg-panel p-6">
        <EditSaleForm sale={sale} flocks={flocks} />
      </section>
      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">Audit trail</h2>
        <FinanceAuditList edits={edits} />
      </section>
    </div>
  );
}
