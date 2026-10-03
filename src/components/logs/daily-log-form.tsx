"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOffline } from "@/components/offline/offline-provider";
import { enqueueDailyLog, getQueueItem, processSyncQueue } from "@/lib/offline/queue";
import { todayIsoDate, CULLS_LABEL, type DailyLog } from "@/lib/logs/types";

const fieldClass =
  "mt-1.5 h-14 w-full rounded-xl border border-line bg-background px-4 text-lg outline-none ring-sage/30 focus:ring-4";

export function DailyLogForm({
  flockId,
  logDate,
  existing,
  minDate,
  canWrite = true,
}: {
  flockId: string;
  logDate: string;
  existing: DailyLog | null;
  minDate: string;
  canWrite?: boolean;
}) {
  const router = useRouter();
  const { online, syncNow } = useOffline();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [queueStatus, setQueueStatus] = useState<"PENDING" | "SYNCED" | "ERROR" | null>(
    null,
  );
  const [isUpdate, setIsUpdate] = useState(Boolean(existing));
  const [ready, setReady] = useState(false);
  const [defaults, setDefaults] = useState({
    mortality: existing?.mortality ?? 0,
    culls: existing?.culls ?? 0,
    feed_consumed_kg: existing?.feed_consumed_kg ?? 0,
    water_liters: existing?.water_liters ?? 0,
    sample_weight_grams: existing?.sample_weight_grams ?? "",
    notes: existing?.notes ?? "",
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const queued = await getQueueItem(flockId, logDate);
      if (cancelled) return;
      if (queued && queued.status !== "SYNCED") {
        setDefaults({
          mortality: queued.mortality,
          culls: queued.culls,
          feed_consumed_kg: queued.feed_consumed_kg,
          water_liters: queued.water_liters,
          sample_weight_grams: queued.sample_weight_grams ?? "",
          notes: queued.notes ?? "",
        });
        setQueueStatus(queued.status);
        setIsUpdate(queued.had_server_row || Boolean(existing));
      } else {
        setQueueStatus(queued?.status === "SYNCED" ? "SYNCED" : null);
        setIsUpdate(Boolean(existing) || queued?.status === "SYNCED");
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [existing, flockId, logDate]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const mortality = Number(form.get("mortality"));
    const cullsRaw = String(form.get("culls") ?? "").trim();
    const culls = cullsRaw === "" ? 0 : Number(cullsRaw);
    const feed = Number(form.get("feed_consumed_kg"));
    const water = Number(form.get("water_liters"));
    const weightRaw = String(form.get("sample_weight_grams") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();
    const reason = String(form.get("reason") ?? "").trim();
    const sampleWeight = weightRaw === "" ? null : Number(weightRaw);

    if (!Number.isInteger(mortality) || mortality < 0) {
      setError("Mortality must be a whole number of 0 or more.");
      return;
    }
    if (!Number.isInteger(culls) || culls < 0) {
      setError(`${CULLS_LABEL} must be a whole number of 0 or more.`);
      return;
    }
    if (Number.isNaN(feed) || feed < 0 || Number.isNaN(water) || water < 0) {
      setError("Feed and water cannot be negative.");
      return;
    }
    if (isUpdate && !reason) {
      setError("A reason is required when changing an existing log.");
      return;
    }
    if (!canWrite) {
      setError(
        "This date cannot be edited.",
      );
      return;
    }

    setPending(true);
    await enqueueDailyLog({
      flock_id: flockId,
      log_date: logDate,
      mortality,
      culls,
      feed_consumed_kg: feed,
      water_liters: water,
      sample_weight_grams: sampleWeight,
      notes: notes || null,
      reason: isUpdate ? reason : null,
      had_server_row: isUpdate,
    });
    setQueueStatus("PENDING");
    setMessage(
      online
        ? "Saved locally. Syncing…"
        : "Saved on this device. It will sync when you are back online.",
    );

    if (online) {
      const result = await processSyncQueue();
      await syncNow();
      if (result.remaining === 0) {
        setQueueStatus("SYNCED");
        setMessage("Synced.");
        setIsUpdate(true);
        router.refresh();
      }
    }
    setPending(false);
  }

  if (!ready) {
    return <p className="text-sm text-muted">Loading form…</p>;
  }

  return (
    <form
      key={`${flockId}-${logDate}-${defaults.mortality}-${queueStatus}`}
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <label className="block flex-1 text-sm font-medium text-ink">
          Date
          <input
            name="log_date"
            type="date"
            required
            min={minDate}
            max={todayIsoDate()}
            defaultValue={logDate}
            onChange={(event) => {
              router.push(`/app/logs/${flockId}?date=${event.target.value}`);
            }}
            className={fieldClass}
          />
        </label>
        {queueStatus === "PENDING" ? (
          <span className="mt-7 rounded-full bg-amber px-2.5 py-1 text-xs font-semibold text-ink">
            Pending sync
          </span>
        ) : queueStatus === "SYNCED" || existing ? (
          <span className="mt-7 rounded-full bg-sage px-2.5 py-1 text-xs font-semibold text-panel">
            Synced
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-ink">
          Mortality
          <input
            name="mortality"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            step={1}
            required
            defaultValue={defaults.mortality}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          {CULLS_LABEL}
          <input
            name="culls"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            step={1}
            defaultValue={defaults.culls || ""}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          Feed (kg)
          <input
            name="feed_consumed_kg"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            required
            defaultValue={defaults.feed_consumed_kg}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          Water (L)
          <input
            name="water_liters"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            required
            defaultValue={defaults.water_liters}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-ink">
        Sample weight (g)
        <input
          name="sample_weight_grams"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          defaultValue={defaults.sample_weight_grams}
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium text-ink">
        Notes
        <textarea
          name="notes"
          rows={3}
          defaultValue={defaults.notes}
          className="mt-1.5 w-full rounded-xl border border-line bg-background px-4 py-3 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>

      {isUpdate && canWrite ? (
        <label className="block text-sm font-medium text-ink">
          Reason for change
          <input
            name="reason"
            required
            className={fieldClass}
          />
        </label>
      ) : null}

      {!canWrite ? (
        <p className="text-sm text-muted">This date cannot be edited.</p>
      ) : null}

      {error ? (
        <p className="text-sm text-copper" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-sage" role="status">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !canWrite}
        className="h-14 w-full rounded-full bg-sage-deep text-base font-medium text-panel disabled:opacity-60"
      >
        {pending ? "Saving…" : isUpdate ? "Update log" : "Save log"}
      </button>
    </form>
  );
}
