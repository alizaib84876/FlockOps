import { createClient } from "@/lib/supabase/server";
import type { DailyLog } from "@/lib/logs/types";

export async function listAllDailyLogs(): Promise<DailyLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_logs")
    .select(
      "id, flock_id, log_date, mortality, culls, feed_consumed_kg, water_liters, sample_weight_grams, notes, recorded_by, created_at, updated_at",
    )
    .order("log_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    flock_id: String(row.flock_id),
    log_date: String(row.log_date),
    mortality: Number(row.mortality),
    culls: Number(row.culls),
    feed_consumed_kg: Number(row.feed_consumed_kg),
    water_liters: Number(row.water_liters),
    sample_weight_grams:
      row.sample_weight_grams === null ? null : Number(row.sample_weight_grams),
    notes: (row.notes as string | null) ?? null,
    recorded_by: (row.recorded_by as string | null) ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }));
}
