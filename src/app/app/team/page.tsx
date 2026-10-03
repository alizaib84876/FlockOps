import { redirect } from "next/navigation";
import { InviteForm } from "@/components/team/invite-form";
import {
  CopyInviteButton,
  MemberStatusButton,
  RevokeInviteButton,
} from "@/components/team/team-actions";
import { requireProfile } from "@/lib/auth/require-profile";
import { roleLabel } from "@/lib/auth/profile";
import { listFarms } from "@/lib/farms/queries";
import { listInvites, listTeamMembers } from "@/lib/team/queries";

export const metadata = {
  title: "Team",
};

export default async function TeamPage() {
  const profile = await requireProfile();
  if (profile.role !== "OWNER") redirect("/app");

  let invites: Awaited<ReturnType<typeof listInvites>> = [];
  let members: Awaited<ReturnType<typeof listTeamMembers>> = [];
  try {
    members = await listTeamMembers();
  } catch {
    members = [];
  }
  try {
    invites = await listInvites();
  } catch {
    invites = [];
  }
  const farms = await listFarms();
  const pending = invites.filter((invite) => !invite.accepted_at);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
          Access
        </p>
        <h1 className="display mt-2 text-4xl text-ink">Team</h1>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold text-ink">New invite</h2>
        <div className="mt-5">
          <InviteForm farms={farms} />
        </div>
      </section>

      {pending.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-ink">Pending invites</h2>
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-panel">
            {pending.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-ink">
                    {invite.full_name} · {invite.role === "SUPERVISOR" ? "Supervisor" : "Worker"}
                  </p>
                  <p className="text-sm text-muted">{invite.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <CopyInviteButton token={invite.token} />
                  <RevokeInviteButton inviteId={invite.id} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-ink">Members</h2>
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-panel">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="font-medium text-ink">
                  {member.full_name} · {roleLabel(member.role)}
                  {!member.is_active ? " · disabled" : ""}
                </p>
                <p className="text-sm text-muted">
                  {member.farm_names.length > 0
                    ? `Farms: ${member.farm_names.join(", ")}`
                    : member.shed_names.length > 0
                      ? `Sheds: ${member.shed_names.join(", ")}`
                      : member.role === "OWNER"
                        ? "All farms"
                        : "No assignments"}
                </p>
              </div>
              {member.role !== "OWNER" ? (
                <MemberStatusButton userId={member.id} isActive={member.is_active} />
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
