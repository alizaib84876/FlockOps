import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DailyLogForm } from "@/components/logs/daily-log-form";
import { LogHistory } from "@/components/logs/log-history";
import { OfflineLogFallback } from "@/components/logs/offline-log-fallback";
import { CacheFlockLogs } from "@/components/offline/cache-flock-logs";
import { requireProfile } from "@/lib/auth/require-profile";
import { roleLabel, type UserRole } from "@/lib/auth/profile";
import { currentLiveBirds, mortalityRatePercent } from "@/lib/formulas";
import { getFlock } from "@/lib/flocks/queries";
import { getDailyLog, listDailyLogEdits, listDailyLogs } from "@/lib/logs/queries";
import { canWriteDailyLog } from "@/lib/logs/permissions";
import { todayIsoDate } from "@/lib/logs/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ flockId: string }>;
}): Promise<Metadata> {
  const { flockId } = await params;
  const flock = await getFlock(flockId);
  return { title: flock ? `Log · ${flock.flock_number}` : "Daily log" };
}

export default async function FlockLogPage({
  params,
  searchParams,
}: {
  params: Promise<{ flockId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const profile = await requireProfile();
  const { flockId } = await params;
  const { date } = await searchParams;
  const logDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIsoDate();

  let flock;
  try {
    flock = await getFlock(flockId);
  } catch {
    return (
      <OfflineLogFallback
        flockId={flockId}
        logDate={logDate}
        canWrite={canWriteDailyLog(profile.role, logDate)}
      />
    );
  }
  if (!flock) notFound();

  let existing;
  let logs;
  try {
    [existing, logs] = await Promise.all([
      getDailyLog(flockId, logDate),
      listDailyLogs(flockId),
    ]);
  } catch {
    return (
      <OfflineLogFallback
        flockId={flockId}
        logDate={logDate}
        canWrite={canWriteDailyLog(profile.role, logDate)}
      />
    );
  }
  const edits = existing ? await listDailyLogEdits(existing.id) : [];
  const totals = logs.reduce(
    (sum, log) => ({
      mortality: sum.mortality + log.mortality,
      culls: sum.culls + log.culls,
      feed: sum.feed + log.feed_consumed_kg,
    }),
    { mortality: 0, culls: 0, feed: 0 },
  );

  const liveBirds = currentLiveBirds({
    initialBirds: flock.initial_birds,
    mortality: totals.mortality,
    culls: totals.culls,
    birdsSold: 0,
  });
  const mortalityPct = mortalityRatePercent({
    initialBirds: flock.initial_birds,
    mortality: totals.mortality,
    culls: totals.culls,
  });

  return (
    <div className="space-y-8">
      <CacheFlockLogs flock={flock} logs={logs} />
      <div>
        <Link href="/app/logs" className="text-sm text-muted hover:text-ink">
          ← Daily logs
        </Link>
        <h1 className="display mt-3 text-4xl text-ink">{flock.flock_number}</h1>
        <p className="mt-2 text-muted">
          {flock.farm_name} · {flock.shed_name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-line bg-panel p-4">
          <p className="text-xs text-muted">Live birds</p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            {liveBirds.toLocaleString()}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-panel p-4">
          <p className="text-xs text-muted">Mortality</p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            {mortalityPct.toFixed(1)}%
          </p>
        </article>
        <article className="col-span-2 rounded-2xl border border-line bg-panel p-4 sm:col-span-1">
          <p className="text-xs text-muted">Feed to date</p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            {totals.feed.toLocaleString()} kg
          </p>
        </article>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-5">
        <h2 className="text-lg font-semibold text-ink">
          {existing ? "Update this day" : "Log this day"}
        </h2>
        <div className="mt-5">
          <DailyLogForm
            key={`${flockId}-${logDate}-${existing?.updated_at ?? "new"}`}
            flockId={flockId}
            logDate={logDate}
            existing={existing}
            minDate={flock.placement_date}
            canWrite={canWriteDailyLog(profile.role, logDate)}
          />
        </div>
      </section>

      {edits.length > 0 ? (
        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="text-lg font-semibold text-ink">Audit trail for {logDate}</h2>
          <ul className="mt-4 space-y-3">
            {edits.map((edit) => (
              <li key={edit.id} className="rounded-xl border border-line px-4 py-3 text-sm">
                <p className="font-medium text-ink">
                  {logFieldLabel(edit.field_name)}: {edit.old_value || "—"} →{" "}
                  {edit.new_value || "—"}
                </p>
                <p className="mt-1 text-muted">{edit.reason}</p>
                <p className="mt-1 text-xs text-muted">
                  {edit.editor_name
                    ? `${edit.editor_name}${
                        edit.editor_role
                          ? ` · ${roleLabel(edit.editor_role as UserRole)}`
                          : ""
                      }`
                    : "Unknown person"}
                  {" · "}
                  {formatAuditTime(edit.created_at)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <LogHistory flockId={flockId} logDate={logDate} logs={logs} />
    </div>
  );
}

function logFieldLabel(field: string) {
  const labels: Record<string, string> = {
    mortality: "Mortality",
    culls: "Sick / culled",
    feed_consumed_kg: "Feed kg",
    water_liters: "Water liters",
    sample_weight_grams: "Sample weight",
    notes: "Notes",
  };
  return labels[field] ?? field;
}

function formatAuditTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(date);
}
