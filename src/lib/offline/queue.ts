import { createClient } from "@/lib/supabase/client";
import {
  db,
  queueId,
  type CachedFlock,
  type CachedLog,
  type QueueItem,
} from "@/lib/offline/db";

export async function getQueueItem(flockId: string, logDate: string) {
  return db.syncQueue.get(queueId(flockId, logDate));
}

export async function listPending() {
  return db.syncQueue.where("status").equals("PENDING").sortBy("queued_at");
}

export async function pendingCount() {
  return db.syncQueue.where("status").equals("PENDING").count();
}

export async function listQueueForFlock(flockId: string) {
  return db.syncQueue.where("flock_id").equals(flockId).toArray();
}

export async function enqueueDailyLog(
  item: Omit<QueueItem, "id" | "queued_at" | "status" | "last_error">,
) {
  const id = queueId(item.flock_id, item.log_date);
  const previous = await db.syncQueue.get(id);
  const record: QueueItem = {
    ...item,
    id,
    status: "PENDING",
    queued_at: new Date().toISOString(),
    last_error: null,
    had_server_row: item.had_server_row || previous?.status === "SYNCED",
  };
  await db.syncQueue.put(record);
  return record;
}

export async function cacheFlockAndLogs(
  flock: Omit<CachedFlock, "cached_at">,
  logs: Omit<CachedLog, "id" | "cached_at">[],
) {
  const cached_at = new Date().toISOString();
  await db.cachedFlocks.put({ ...flock, cached_at });
  await db.cachedLogs.bulkPut(
    logs.map((log) => ({
      ...log,
      id: queueId(log.flock_id, log.log_date),
      cached_at,
    })),
  );
}

export async function getCachedFlock(flockId: string) {
  return db.cachedFlocks.get(flockId);
}

export async function getCachedLogs(flockId: string) {
  return db.cachedLogs.where("flock_id").equals(flockId).toArray();
}

function isNetworkError(message: string) {
  return /failed to fetch|networkerror|offline|load failed/i.test(message);
}

export async function processSyncQueue() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { processed: 0, remaining: await pendingCount() };
  }

  const pending = await listPending();
  const supabase = createClient();
  let processed = 0;

  for (const item of pending) {
    const { error } = await supabase.rpc("save_daily_log", {
      p_flock_id: item.flock_id,
      p_log_date: item.log_date,
      p_mortality: item.mortality,
      p_culls: item.culls,
      p_feed_consumed_kg: item.feed_consumed_kg,
      p_water_liters: item.water_liters,
      p_sample_weight_grams: item.sample_weight_grams,
      p_notes: item.notes,
      p_reason: item.had_server_row ? item.reason : null,
    });

    if (error) {
      if (isNetworkError(error.message)) {
        break;
      }
      await db.syncQueue.update(item.id, {
        status: "ERROR",
        last_error: error.message,
      });
      continue;
    }

    await db.syncQueue.update(item.id, {
      status: "SYNCED",
      last_error: null,
      had_server_row: true,
    });
    processed += 1;
  }

  return { processed, remaining: await pendingCount() };
}
