import {
  ButtonBone,
  FieldBones,
  PageChrome,
  Panel,
  StatCards,
} from "@/components/app/page-skeleton";

export default function FlockDetailLoading() {
  return (
    <div className="space-y-10">
      <PageChrome back="← Flocks" title="Flock" />
      <StatCards count={3} />
      <Panel title="Flock details">
        <FieldBones count={4} columns={2} />
        <ButtonBone className="mt-4" />
      </Panel>
    </div>
  );
}
