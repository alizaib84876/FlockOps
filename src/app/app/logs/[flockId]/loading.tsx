import {
  Bone,
  ButtonBone,
  FieldBones,
  PageChrome,
  Panel,
  StatCards,
} from "@/components/app/page-skeleton";

export default function FlockLogLoading() {
  return (
    <div className="space-y-8">
      <PageChrome back="← Daily logs" title="Daily log" />
      <StatCards count={3} />
      <Panel title="Log this day">
        <FieldBones count={6} columns={2} />
        <ButtonBone className="mt-4" />
      </Panel>
      <section>
        <h2 className="text-lg font-semibold text-ink">History</h2>
        <ul className="mt-4 space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <li key={index} className="rounded-xl border border-line px-4 py-3">
              <Bone className="h-4 w-40" />
              <Bone className="mt-2 h-4 w-56" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
