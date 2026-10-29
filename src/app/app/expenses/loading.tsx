import {
  ButtonBone,
  FieldBones,
  LedgerRows,
  PageChrome,
  Panel,
} from "@/components/app/page-skeleton";

export default function ExpensesLoading() {
  return (
    <div className="space-y-10">
      <PageChrome kicker="Finance" title="Expenses" />
      <Panel title="Add an expense">
        <FieldBones count={6} columns={2} />
        <ButtonBone className="mt-4" />
      </Panel>
      <section>
        <h2 className="text-lg font-semibold text-ink">Ledger</h2>
        <div className="mt-4">
          <LedgerRows count={4} />
        </div>
      </section>
      <Panel title="Record a sale">
        <FieldBones count={6} columns={2} />
        <ButtonBone className="mt-4" />
      </Panel>
      <section>
        <h2 className="text-lg font-semibold text-ink">Sales</h2>
        <div className="mt-4">
          <LedgerRows count={3} />
        </div>
      </section>
    </div>
  );
}
