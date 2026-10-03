"use client";

import { useEffect } from "react";
import { cacheFlockAndLogs } from "@/lib/offline/queue";
import type { DailyLog } from "@/lib/logs/types";
import type { FlockWithSite } from "@/lib/flocks/types";

export function CacheFlockLogs({
  flock,
  logs,
}: {
  flock: FlockWithSite;
  logs: DailyLog[];
}) {
  useEffect(() => {
    void cacheFlockAndLogs(
      {
        id: flock.id,
        flock_number: flock.flock_number,
        farm_name: flock.farm_name,
        shed_name: flock.shed_name,
        placement_date: flock.placement_date,
        initial_birds: flock.initial_birds,
      },
      logs.map((log) => ({
        flock_id: log.flock_id,
        log_date: log.log_date,
        mortality: log.mortality,
        culls: log.culls,
        feed_consumed_kg: log.feed_consumed_kg,
        water_liters: log.water_liters,
        sample_weight_grams: log.sample_weight_grams,
        notes: log.notes,
        created_at: log.created_at,
        updated_at: log.updated_at,
      })),
    );
  }, [flock, logs]);

  return null;
}
