import {
  ButtonBone,
  FieldBones,
  ListRows,
  PageChrome,
  Panel,
} from "@/components/app/page-skeleton";

export default function FlocksLoading() {
  return (
    <div className="space-y-10">
      <PageChrome kicker="Batches" title="Flocks" />
      <Panel title="Place a flock">
        <FieldBones count={6} columns={2} />
        <ButtonBone className="mt-4" />
      </Panel>
      <section>
        <h2 className="text-lg font-semibold text-ink">All flocks</h2>
        <div className="mt-4">
          <ListRows count={4} />
        </div>
      </section>
    </div>
  );
}
