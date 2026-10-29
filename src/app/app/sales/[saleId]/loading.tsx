import {
  ButtonBone,
  FieldBones,
  LedgerRows,
  PageChrome,
  Panel,
} from "@/components/app/page-skeleton";

export default function SaleDetailLoading() {
  return (
    <div className="space-y-8">
      <PageChrome back="← Expenses" title="Correct sale" />
      <Panel>
        <FieldBones count={8} columns={2} />
        <ButtonBone className="mt-4" />
      </Panel>
      <Panel title="Audit trail">
        <LedgerRows count={3} />
      </Panel>
    </div>
  );
}
