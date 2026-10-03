import { createClient } from "@/lib/supabase/server";
import type { DailyLog, DailyLogEdit } from "@/lib/logs/types";

function mapLog(row: Record<string, unknown>): DailyLog {
  return {
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
  };
}

export async function listDailyLogs(flockId: string): Promise<DailyLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_logs")
    .select(
      "id, flock_id, log_date, mortality, culls, feed_consumed_kg, water_liters, sample_weight_grams, notes, recorded_by, created_at, updated_at",
    )
    .eq("flock_id", flockId)
    .order("log_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapLog(row as Record<string, unknown>));
}

export async function getDailyLog(flockId: string, logDate: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_logs")
    .select(
      "id, flock_id, log_date, mortality, culls, feed_consumed_kg, water_liters, sample_weight_grams, notes, recorded_by, created_at, updated_at",
    )
    .eq("flock_id", flockId)
    .eq("log_date", logDate)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapLog(data as Record<string, unknown>) : null;
}

export async function listDailyLogEdits(dailyLogId: string): Promise<DailyLogEdit[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_log_edits")
    .select("id, field_name, old_value, new_value, reason, created_at, edited_by")
    .eq("daily_log_id", dailyLogId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const editorIds = [
    ...new Set(
      (data ?? [])
        .map((row) => (row.edited_by ? String(row.edited_by) : null))
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const names = new Map<string, { full_name: string; role: string | null }>();
  if (editorIds.length > 0) {
    const { data: people } = await supabase
      .from("users")
      .select("id, full_name, role")
      .in("id", editorIds);
    for (const person of people ?? []) {
      names.set(String(person.id), {
        full_name: String(person.full_name),
        role: person.role ? String(person.role) : null,
      });
    }
  }

  return (data ?? []).map((row) => {
    const editor = row.edited_by ? names.get(String(row.edited_by)) : undefined;
    return {
      id: String(row.id),
      field_name: String(row.field_name),
      old_value: String(row.old_value ?? ""),
      new_value: String(row.new_value ?? ""),
      reason: String(row.reason ?? ""),
      created_at: String(row.created_at),
      edited_by: row.edited_by ? String(row.edited_by) : null,
      editor_name: editor?.full_name ?? null,
      editor_role: editor?.role ?? null,
    };
  });
}

export async function getFlockLogTotals(flockId: string) {
  const logs = await listDailyLogs(flockId);
  return logs.reduce(
    (sum, log) => ({
      mortality: sum.mortality + log.mortality,
      culls: sum.culls + log.culls,
      feed: sum.feed + log.feed_consumed_kg,
    }),
    { mortality: 0, culls: 0, feed: 0 },
  );
}
