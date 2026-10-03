export type DailyLogEdit = {
  id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  reason: string;
  created_at: string;
  edited_by: string | null;
  editor_name: string | null;
  editor_role: string | null;
};

export const CULLS_LABEL = "Sick / culled";

export type DailyLog = {
  id: string;
  flock_id: string;
  log_date: string;
  mortality: number;
  culls: number;
  feed_consumed_kg: number;
  water_liters: number;
  sample_weight_grams: number | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
};

export function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
