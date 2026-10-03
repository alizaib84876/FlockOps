import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/auth/profile";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, organization_id, full_name, phone_number, role, status, is_active, organization:organizations(id, name, slug)",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  const organization = Array.isArray(data.organization)
    ? (data.organization[0] ?? null)
    : data.organization;

  return { ...data, organization } as Profile;
}
