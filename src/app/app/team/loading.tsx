import {
  ButtonBone,
  FieldBones,
  LedgerRows,
  PageChrome,
  Panel,
} from "@/components/app/page-skeleton";

export default function TeamLoading() {
  return (
    <div className="space-y-10">
      <PageChrome kicker="Access" title="Team" />
      <Panel title="New invite">
        <FieldBones count={4} />
        <ButtonBone className="mt-4" />
      </Panel>
      <section>
        <h2 className="text-lg font-semibold text-ink">Members</h2>
        <div className="mt-4">
          <LedgerRows count={3} />
        </div>
      </section>
    </div>
  );
}
