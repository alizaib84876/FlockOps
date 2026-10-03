"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; ok?: boolean };

export async function updateProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireProfile();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phoneNumber = String(formData.get("phone_number") ?? "").trim();
  if (!fullName) return { error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_own_profile", {
    p_full_name: fullName,
    p_phone_number: phoneNumber,
  });
  if (error) {
    if (
      error.message.includes("Could not find the function") ||
      error.code === "PGRST202"
    ) {
      return {
        error:
          "Run supabase/migrations/0008_update_own_profile.sql in the Supabase SQL editor.",
      };
    }
    return { error: error.message };
  }
  revalidatePath("/app/account");
  revalidatePath("/app");
  return { ok: true };
}
