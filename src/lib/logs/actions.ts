"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { canWriteDailyLog } from "@/lib/logs/permissions";
import { CULLS_LABEL } from "@/lib/logs/types";

export type ActionState = {
  error?: string;
  ok?: boolean;
};

function read(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function asInt(value: FormDataEntryValue | null) {
  const n = Number(value);
  return Number.isInteger(n) ? n : NaN;
}

function asNum(value: FormDataEntryValue | null) {
  if (value === null || String(value).trim() === "") return 0;
  return Number(value);
}

export async function saveDailyLog(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireProfile();

  const flockId = read(formData, "flock_id");
  const logDate = read(formData, "log_date");
  const mortality = asInt(formData.get("mortality"));
  const cullsRaw = read(formData, "culls");
  const culls = cullsRaw === "" ? 0 : asInt(formData.get("culls"));
  const feed = asNum(formData.get("feed_consumed_kg"));
  const water = asNum(formData.get("water_liters"));
  const weightRaw = read(formData, "sample_weight_grams");
  const notes = read(formData, "notes");
  const reason = read(formData, "reason");
  const isUpdate = read(formData, "is_update") === "true";
  const sampleWeight = weightRaw === "" ? null : Number(weightRaw);

  if (!flockId || !logDate) return { error: "Flock and date are required." };
  if (mortality < 0 || Number.isNaN(mortality)) {
    return { error: "Mortality must be a whole number of 0 or more." };
  }
  if (culls < 0 || Number.isNaN(culls)) {
    return { error: `${CULLS_LABEL} must be a whole number of 0 or more.` };
  }
  if (Number.isNaN(feed) || feed < 0) return { error: "Feed cannot be negative." };
  if (Number.isNaN(water) || water < 0) return { error: "Water cannot be negative." };
  if (sampleWeight !== null && (Number.isNaN(sampleWeight) || sampleWeight < 0)) {
    return { error: "Sample weight cannot be negative." };
  }
  if (isUpdate && !reason) {
    return { error: "A reason is required when changing an existing log." };
  }
  if (!canWriteDailyLog(profile.role, logDate)) {
    return { error: "This date cannot be edited." };
  }

  const supabase = await createClient();
  const payload = {
    p_flock_id: flockId,
    p_log_date: logDate,
    p_mortality: mortality,
    p_culls: culls,
    p_feed_consumed_kg: feed,
    p_water_liters: water,
    p_sample_weight_grams: sampleWeight,
    p_notes: notes,
    p_reason: isUpdate ? reason : null,
  };

  const { error: rpcError } = await supabase.rpc("save_daily_log", payload);

  if (rpcError) {
    const missingFn =
      rpcError.message.includes("Could not find the function") ||
      rpcError.code === "PGRST202";

    if (missingFn && !isUpdate) {
      const { error: insertError } = await supabase.from("daily_logs").insert({
        flock_id: flockId,
        log_date: logDate,
        mortality,
        culls,
        feed_consumed_kg: feed,
        water_liters: water,
        sample_weight_grams: sampleWeight,
        notes: notes || null,
        recorded_by: (await supabase.auth.getUser()).data.user?.id ?? null,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          return {
            error:
              "A log already exists for this date. Run supabase/migrations/0002_save_daily_log.sql to enable edits.",
          };
        }
        return { error: insertError.message };
      }
    } else if (missingFn) {
      return {
        error:
          "Run supabase/migrations/0002_save_daily_log.sql in the Supabase SQL editor to enable log edits.",
      };
    } else {
      return { error: rpcError.message };
    }
  }

  revalidatePath("/app/logs");
  revalidatePath(`/app/logs/${flockId}`);
  revalidatePath(`/app/flocks/${flockId}`);
  return { ok: true };
}
