import { createClient } from "@/lib/supabase/server";
import type { Invite, InvitePreview, InviteRole, TeamMember } from "@/lib/team/types";

export async function listInvites(): Promise<Invite[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invites")
    .select(
      "id, email, full_name, role, token, farm_ids, shed_ids, accepted_at, expires_at, created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    email: String(row.email),
    full_name: String(row.full_name),
    role: row.role as InviteRole,
    token: String(row.token),
    farm_ids: (row.farm_ids as string[] | null) ?? [],
    shed_ids: (row.shed_ids as string[] | null) ?? [],
    accepted_at: row.accepted_at ? String(row.accepted_at) : null,
    expires_at: String(row.expires_at),
    created_at: String(row.created_at),
  }));
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, full_name, phone_number, role, is_active, user_farm_assignments(farms(name)), user_shed_assignments(sheds(name))",
    )
    .order("created_at");
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const farms = (row.user_farm_assignments ?? []) as {
      farms: { name: string } | { name: string }[] | null;
    }[];
    const sheds = (row.user_shed_assignments ?? []) as {
      sheds: { name: string } | { name: string }[] | null;
    }[];
    return {
      id: String(row.id),
      full_name: String(row.full_name),
      phone_number: row.phone_number ? String(row.phone_number) : null,
      role: row.role as TeamMember["role"],
      is_active: Boolean(row.is_active),
      farm_names: farms
        .map((item) =>
          Array.isArray(item.farms) ? item.farms[0]?.name : item.farms?.name,
        )
        .filter((name): name is string => Boolean(name)),
      shed_names: sheds
        .map((item) =>
          Array.isArray(item.sheds) ? item.sheds[0]?.name : item.sheds?.name,
        )
        .filter((name): name is string => Boolean(name)),
    };
  });
}

export async function getInvitePreview(
  token: string,
): Promise<InvitePreview | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_invite_preview", {
    p_token: token,
  });
  if (error || !data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    organization_name: String(row.organization_name),
    invite_role: row.invite_role as InviteRole,
    full_name: String(row.full_name),
    email: String(row.email),
    expired: Boolean(row.expired),
    accepted: Boolean(row.accepted),
  };
}
