"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/require-profile";
import { canManageFlocks } from "@/lib/flocks/types";
import { createClient } from "@/lib/supabase/server";

export type ActionState = {
  error?: string;
};

function manageOnly(role: string) {
  if (!canManageFlocks(role)) {
    return "Only owners and supervisors can manage flocks.";
  }
  return null;
}

function read(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function revalidateFlocks(flockId?: string) {
  revalidatePath("/app");
  revalidatePath("/app/flocks");
  if (flockId) revalidatePath(`/app/flocks/${flockId}`);
}

export async function createFlock(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  const denied = manageOnly(profile.role);
  if (denied) return { error: denied };

  const shedId = read(formData, "shed_id");
  const flockNumber = read(formData, "flock_number");
  const placementDate = read(formData, "placement_date");
  const breed = read(formData, "breed");
  const initialBirds = Number(formData.get("initial_birds"));
  const costPerChick = Number(formData.get("cost_per_chick") || 0);

  if (!shedId) return { error: "Select a shed." };
  if (!flockNumber) return { error: "Flock number is required." };
  if (!placementDate) return { error: "Placement date is required." };
  if (!Number.isInteger(initialBirds) || initialBirds <= 0) {
    return { error: "Initial birds must be a whole number greater than zero." };
  }
  if (Number.isNaN(costPerChick) || costPerChick < 0) {
    return { error: "Cost per chick cannot be negative." };
  }

  const supabase = await createClient();

  const { data: occupied, error: occupiedError } = await supabase
    .from("flocks")
    .select("id")
    .eq("shed_id", shedId)
    .eq("status", "ACTIVE")
    .limit(1);

  if (occupiedError) return { error: occupiedError.message };
  if (occupied && occupied.length > 0) {
    return {
      error: "This shed already has an active flock. Harvest or close it first.",
    };
  }

  const { data, error } = await supabase
    .from("flocks")
    .insert({
      shed_id: shedId,
      flock_number: flockNumber,
      placement_date: placementDate,
      initial_birds: initialBirds,
      breed: breed || null,
      cost_per_chick: costPerChick,
      status: "ACTIVE",
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return { error: "That flock number is already used in this shed." };
    }
    return { error: error?.message ?? "Could not place the flock." };
  }

  revalidateFlocks(data.id);
  redirect(`/app/flocks/${data.id}`);
}

export async function updateFlock(
  flockId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  const denied = manageOnly(profile.role);
  if (denied) return { error: denied };

  const flockNumber = read(formData, "flock_number");
  const breed = read(formData, "breed");
  const costPerChick = Number(formData.get("cost_per_chick") || 0);

  if (!flockNumber) return { error: "Flock number is required." };
  if (Number.isNaN(costPerChick) || costPerChick < 0) {
    return { error: "Cost per chick cannot be negative." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("flocks")
    .update({
      flock_number: flockNumber,
      breed: breed || null,
      cost_per_chick: costPerChick,
    })
    .eq("id", flockId);

  if (error) {
    if (error.code === "23505") {
      return { error: "That flock number is already used in this shed." };
    }
    return { error: error.message };
  }

  revalidateFlocks(flockId);
  return {};
}

export async function harvestFlock(
  flockId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();
  const denied = manageOnly(profile.role);
  if (denied) return { error: denied };

  const harvestDate = read(formData, "harvest_date");
  if (!harvestDate) return { error: "Harvest date is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("flocks")
    .update({
      status: "HARVESTED",
      harvest_date: harvestDate,
    })
    .eq("id", flockId)
    .eq("status", "ACTIVE");

  if (error) return { error: error.message };

  revalidateFlocks(flockId);
  return {};
}

export async function closeFlock(flockId: string): Promise<ActionState> {
  const profile = await requireProfile();
  const denied = manageOnly(profile.role);
  if (denied) return { error: denied };

  const supabase = await createClient();
  const { error } = await supabase
    .from("flocks")
    .update({ status: "CLOSED" })
    .eq("id", flockId);

  if (error) return { error: error.message };

  revalidateFlocks(flockId);
  return {};
}
