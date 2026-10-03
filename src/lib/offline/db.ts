import Dexie, { type EntityTable } from "dexie";

export type SyncStatus = "PENDING" | "SYNCED" | "ERROR";

export type QueueItem = {
  id: string;
  flock_id: string;
  log_date: string;
  mortality: number;
  culls: number;
  feed_consumed_kg: number;
  water_liters: number;
  sample_weight_grams: number | null;
  notes: string | null;
  reason: string | null;
  had_server_row: boolean;
  status: SyncStatus;
  queued_at: string;
  last_error: string | null;
};

export type CachedFlock = {
  id: string;
  flock_number: string;
  farm_name: string;
  shed_name: string;
  placement_date: string;
  initial_birds: number;
  cached_at: string;
};

export type CachedLog = {
  id: string;
  flock_id: string;
  log_date: string;
  mortality: number;
  culls: number;
  feed_consumed_kg: number;
  water_liters: number;
  sample_weight_grams: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  cached_at: string;
};

export function queueId(flockId: string, logDate: string) {
  return `${flockId}:${logDate}`;
}

export const db = new Dexie("flockops") as Dexie & {
  syncQueue: EntityTable<QueueItem, "id">;
  cachedFlocks: EntityTable<CachedFlock, "id">;
  cachedLogs: EntityTable<CachedLog, "id">;
};

db.version(1).stores({
  syncQueue: "id, flock_id, log_date, status, queued_at",
  cachedFlocks: "id, cached_at",
  cachedLogs: "id, flock_id, log_date, cached_at",
});
