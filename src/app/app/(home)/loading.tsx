import {
  Bone,
  ButtonBone,
  PageChrome,
  Panel,
  StatCards,
} from "@/components/app/page-skeleton";

export default function OverviewLoading() {
  return (
    <div className="space-y-10">
      <PageChrome kicker="Overview" title="Welcome" />
      <StatCards count={3} />
      <Panel>
        <Bone className="h-5 w-36" />
        <Bone className="mt-2 h-4 w-48" />
        <ul className="mt-5 divide-y divide-line">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index} className="py-3">
              <Bone className="h-5 w-28" />
              <Bone className="mt-2 h-4 w-52" />
            </li>
          ))}
        </ul>
      </Panel>
      <div className="flex flex-wrap gap-3">
        <ButtonBone />
        <ButtonBone className="bg-panel" />
      </div>
    </div>
  );
}
