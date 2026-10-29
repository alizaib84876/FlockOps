import {
  Bone,
  ButtonBone,
  FieldBones,
  PageChrome,
  Panel,
} from "@/components/app/page-skeleton";

export default function FarmDetailLoading() {
  return (
    <div className="space-y-10">
      <PageChrome back="← Farms" title="Farm" />
      <Panel title="Farm details">
        <FieldBones count={2} />
        <ButtonBone className="mt-4" />
      </Panel>
      <Panel title="Sheds">
        <FieldBones count={2} columns={2} />
        <ul className="mt-6 divide-y divide-line">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index} className="flex justify-between py-3">
              <Bone className="h-5 w-28" />
              <Bone className="h-5 w-20" />
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
