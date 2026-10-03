"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { liveQuery } from "dexie";
import { db, type QueueItem } from "@/lib/offline/db";
import type { DailyLog } from "@/lib/logs/types";

export function LogHistory({
  flockId,
  logDate,
  logs,
}: {
  flockId: string;
  logDate: string;
  logs: DailyLog[];
}) {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    const sub = liveQuery(() =>
      db.syncQueue.where("flock_id").equals(flockId).toArray(),
    ).subscribe({
      next: setQueue,
      error: () => setQueue([]),
    });
    return () => sub.unsubscribe();
  }, [flockId]);

  const rows = useMemo(() => {
    const map = new Map<
      string,
      {
        log_date: string;
        mortality: number;
        culls: number;
        feed_consumed_kg: number;
        edited: boolean;
        sync: "SYNCED" | "PENDING" | "ERROR";
      }
    >();

    for (const log of logs) {
      map.set(log.log_date, {
        log_date: log.log_date,
        mortality: log.mortality,
        culls: log.culls,
        feed_consumed_kg: log.feed_consumed_kg,
        edited: log.updated_at !== log.created_at,
        sync: "SYNCED",
      });
    }

    for (const item of queue) {
      if (item.status === "PENDING" || item.status === "ERROR") {
        map.set(item.log_date, {
          log_date: item.log_date,
          mortality: item.mortality,
          culls: item.culls,
          feed_consumed_kg: item.feed_consumed_kg,
          edited: item.had_server_row,
          sync: item.status,
        });
      }
    }

    return [...map.values()].sort((a, b) => b.log_date.localeCompare(a.log_date));
  }, [logs, queue]);

  return (
    <section>
      <h2 className="text-lg font-semibold text-ink">
        Days logged · {rows.length}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No logs yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-panel">
          {rows.map((row) => (
            <li key={row.log_date}>
              <Link
                href={`/app/logs/${flockId}?date=${row.log_date}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-background"
              >
                <span className="font-medium text-ink">
                  {row.log_date}
                  {row.log_date === logDate ? " · viewing" : ""}
                  {row.edited && row.sync === "SYNCED" ? " · edited" : ""}
                </span>
                <span className="flex items-center gap-2 text-muted">
                  {row.sync === "PENDING" ? (
                    <span className="rounded-full bg-amber px-2 py-0.5 text-[11px] font-semibold text-ink">
                      Pending sync
                    </span>
                  ) : row.sync === "ERROR" ? (
                    <span className="rounded-full bg-copper px-2 py-0.5 text-[11px] font-semibold text-panel">
                      Sync error
                    </span>
                  ) : (
                    <span className="rounded-full bg-sage px-2 py-0.5 text-[11px] font-semibold text-panel">
                      Synced
                    </span>
                  )}
                  M {row.mortality}
                  {row.culls > 0 ? ` · S ${row.culls}` : ""} ·{" "}
                  {row.feed_consumed_kg} kg
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
