"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";

export type ActionState = {
  error?: string;
};

function ownerOnly(role: string) {
  if (role !== "OWNER") {
    return "Only the owner can change farms and sheds.";
  }
  return null;
}

function readName(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

export async function createFarm(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  const denied = ownerOnly(profile.role);
  if (denied) return { error: denied };

  const name = readName(formData, "name");
  const location = readName(formData, "location");
  if (!name) return { error: "Farm name is required." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("farms")
    .insert({
      organization_id: profile.organization_id,
      name,
      location: location || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not create the farm." };
  }

  revalidatePath("/app");
  revalidatePath("/app/farms");
  redirect(`/app/farms/${data.id}`);
}

export async function updateFarm(
  farmId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  const denied = ownerOnly(profile.role);
  if (denied) return { error: denied };

  const name = readName(formData, "name");
  const location = readName(formData, "location");
  if (!name) return { error: "Farm name is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("farms")
    .update({ name, location: location || null })
    .eq("id", farmId)
    .eq("organization_id", profile.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/app");
  revalidatePath("/app/farms");
  revalidatePath(`/app/farms/${farmId}`);
  return {};
}

export async function setFarmArchived(farmId: string, archived: boolean) {
  const profile = await requireProfile();
  const denied = ownerOnly(profile.role);
  if (denied) return { error: denied };

  const supabase = await createClient();
  const { error } = await supabase
    .from("farms")
    .update({ archived })
    .eq("id", farmId)
    .eq("organization_id", profile.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/app");
  revalidatePath("/app/farms");
  revalidatePath(`/app/farms/${farmId}`);
  return {};
}

export async function createShed(
  farmId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  const denied = ownerOnly(profile.role);
  if (denied) return { error: denied };

  const name = readName(formData, "name");
  const capacity = Number(formData.get("capacity"));
  if (!name) return { error: "Shed name is required." };
  if (!Number.isInteger(capacity) || capacity <= 0) {
    return { error: "Capacity must be a whole number greater than zero." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("sheds").insert({
    farm_id: farmId,
    name,
    capacity,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A shed with this name already exists on the farm." };
    }
    return { error: error.message };
  }

  revalidatePath("/app/farms");
  revalidatePath(`/app/farms/${farmId}`);
  return {};
}

export async function updateShed(
  farmId: string,
  shedId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  const denied = ownerOnly(profile.role);
  if (denied) return { error: denied };

  const name = readName(formData, "name");
  const capacity = Number(formData.get("capacity"));
  if (!name) return { error: "Shed name is required." };
  if (!Number.isInteger(capacity) || capacity <= 0) {
    return { error: "Capacity must be a whole number greater than zero." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("sheds")
    .update({ name, capacity })
    .eq("id", shedId)
    .eq("farm_id", farmId);

  if (error) {
    if (error.code === "23505") {
      return { error: "A shed with this name already exists on the farm." };
    }
    return { error: error.message };
  }

  revalidatePath("/app/farms");
  revalidatePath(`/app/farms/${farmId}`);
  return {};
}
