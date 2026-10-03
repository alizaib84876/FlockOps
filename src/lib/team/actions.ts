"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; inviteUrl?: string };

function read(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

export async function createInvite(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  if (profile.role !== "OWNER") {
    return { error: "Only the owner can invite team members." };
  }

  const email = read(formData, "email").toLowerCase();
  const fullName = read(formData, "full_name");
  const phoneNumber = read(formData, "phone_number");
  const role = read(formData, "role");
  const farmIds = formData.getAll("farm_ids").map(String).filter(Boolean);
  const shedIds = formData.getAll("shed_ids").map(String).filter(Boolean);

  if (!email) return { error: "Email is required." };
  if (!fullName) return { error: "Name is required." };
  if (role !== "SUPERVISOR" && role !== "WORKER") {
    return { error: "Select supervisor or worker." };
  }
  if (role === "SUPERVISOR" && farmIds.length === 0) {
    return { error: "Assign at least one farm to a supervisor." };
  }
  if (role === "WORKER" && shedIds.length === 0) {
    return { error: "Assign at least one shed to a worker." };
  }

  const token = randomBytes(24).toString("hex");
  const supabase = await createClient();
  const { error } = await supabase.from("invites").insert({
    organization_id: profile.organization_id,
    email,
    full_name: fullName,
    phone_number: phoneNumber || null,
    role,
    token,
    farm_ids: role === "SUPERVISOR" ? farmIds : [],
    shed_ids: role === "WORKER" ? shedIds : [],
    invited_by: profile.id,
  });

  if (error) {
    if (
      error.message.includes("Could not find the table") ||
      error.code === "PGRST205"
    ) {
      return {
        error:
          "Run supabase/migrations/0005_team_invites.sql in the Supabase SQL editor first.",
      };
    }
    return { error: error.message };
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  revalidatePath("/app/team");
  return { inviteUrl: `${origin}/signup?invite=${token}` };
}

export async function revokeInvite(inviteId: string) {
  const profile = await requireProfile();
  if (profile.role !== "OWNER") return { error: "Only the owner can revoke invites." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("invites")
    .delete()
    .eq("id", inviteId)
    .is("accepted_at", null);
  if (error) return { error: error.message };
  revalidatePath("/app/team");
  return {};
}

export async function setMemberActive(userId: string, isActive: boolean) {
  const profile = await requireProfile();
  if (profile.role !== "OWNER") return { error: "Only the owner can update members." };
  if (userId === profile.id) return { error: "You cannot disable your own account." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ is_active: isActive, status: isActive ? "ACTIVE" : "DISABLED" })
    .eq("id", userId)
    .eq("organization_id", profile.organization_id);
  if (error) return { error: error.message };
  revalidatePath("/app/team");
  return {};
}
