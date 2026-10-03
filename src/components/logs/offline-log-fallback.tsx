"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DailyLogForm } from "@/components/logs/daily-log-form";
import { LogHistory } from "@/components/logs/log-history";
import { getCachedFlock, getCachedLogs } from "@/lib/offline/queue";
import type { CachedFlock, CachedLog } from "@/lib/offline/db";
import type { DailyLog } from "@/lib/logs/types";

function toDailyLog(row: CachedLog): DailyLog {
  return {
    id: row.id,
    flock_id: row.flock_id,
    log_date: row.log_date,
    mortality: row.mortality,
    culls: row.culls,
    feed_consumed_kg: row.feed_consumed_kg,
    water_liters: row.water_liters,
    sample_weight_grams: row.sample_weight_grams,
    notes: row.notes,
    recorded_by: null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function OfflineLogFallback({
  flockId,
  logDate,
  canWrite = true,
}: {
  flockId: string;
  logDate: string;
  canWrite?: boolean;
}) {
  const [flock, setFlock] = useState<CachedFlock | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      const cachedFlock = await getCachedFlock(flockId);
      const cachedLogs = await getCachedLogs(flockId);
      setFlock(cachedFlock ?? null);
      setLogs(cachedLogs.map(toDailyLog));
      setLoaded(true);
    })();
  }, [flockId]);

  if (!loaded) {
    return <p className="text-sm text-muted">Loading cached logs…</p>;
  }

  if (!flock) {
    return (
      <div>
        <p className="text-ink">This flock is not available offline.</p>
        <Link href="/app/logs" className="mt-4 inline-block text-sm text-sage">
          ← Daily logs
        </Link>
      </div>
    );
  }

  const existing =
    logs.find((log) => log.log_date === logDate) ?? null;

  return (
    <div className="space-y-8">
      <div>
        <p className="rounded-full bg-amber px-3 py-1 text-xs font-semibold text-ink inline-block">
          Offline copy
        </p>
        <h1 className="display mt-3 text-4xl text-ink">{flock.flock_number}</h1>
        <p className="mt-2 text-muted">
          {flock.farm_name} · {flock.shed_name}
        </p>
      </div>
      <section className="rounded-2xl border border-line bg-panel p-5">
        <DailyLogForm
          flockId={flockId}
          logDate={logDate}
          existing={existing}
          minDate={flock.placement_date}
          canWrite={canWrite}
        />
      </section>
      <LogHistory flockId={flockId} logDate={logDate} logs={logs} />
    </div>
  );
}
