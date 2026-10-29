import {
  ButtonBone,
  FieldBones,
  ListRows,
  PageChrome,
  Panel,
} from "@/components/app/page-skeleton";

export default function FarmsLoading() {
  return (
    <div className="space-y-10">
      <PageChrome kicker="Sites" title="Farms & sheds" />
      <Panel title="Add a farm">
        <FieldBones count={2} />
        <ButtonBone className="mt-4" />
      </Panel>
      <section>
        <h2 className="text-lg font-semibold text-ink">Active farms</h2>
        <div className="mt-4">
          <ListRows count={3} />
        </div>
      </section>
    </div>
  );
}
