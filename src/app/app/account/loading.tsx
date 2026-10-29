import {
  ButtonBone,
  FieldBones,
  PageChrome,
  Panel,
} from "@/components/app/page-skeleton";

export default function AccountLoading() {
  return (
    <div className="space-y-10">
      <PageChrome kicker="Settings" title="Account" />
      <Panel title="Workspace">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldBones count={4} />
        </div>
      </Panel>
      <Panel title="Profile">
        <FieldBones count={3} />
        <ButtonBone className="mt-4" />
      </Panel>
      <Panel title="Password">
        <FieldBones count={3} />
        <ButtonBone className="mt-4" />
      </Panel>
      <Panel title="Devices">
        <div className="flex gap-3">
          <ButtonBone />
          <ButtonBone />
        </div>
      </Panel>
    </div>
  );
}
