import Link from "next/link";
import { MissingLogsReminder } from "@/components/logs/missing-logs-reminder";
import { requireProfile } from "@/lib/auth/require-profile";
import { listFlocks } from "@/lib/flocks/queries";
import { listAllDailyLogs } from "@/lib/logs/all";
import { missingLogsByFarm } from "@/lib/logs/missing";
import { todayIsoDate } from "@/lib/logs/types";

export const metadata = {
  title: "Daily logs",
};

export default async function LogsIndexPage() {
  const profile = await requireProfile();
  const isWorker = profile.role === "WORKER";
  const flocks = await listFlocks();
  const logs = await listAllDailyLogs();
  const active = flocks.filter((flock) => flock.status === "ACTIVE");
  const others = flocks.filter((flock) => flock.status !== "ACTIVE");
  const missingToday = missingLogsByFarm(flocks, logs, todayIsoDate());

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
          Field
        </p>
        <h1 className="display mt-2 text-4xl text-ink">Daily logs</h1>
      </div>

      <MissingLogsReminder date={todayIsoDate()} groups={missingToday} />

      <section>
        <h2 className="text-lg font-semibold text-ink">Active flocks</h2>
          {active.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-panel px-5 py-8 text-sm text-muted">
            No active flocks.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {active.map((flock) => (
              <li key={flock.id}>
                <Link
                  href={`/app/logs/${flock.id}`}
                  className="flex items-center justify-between rounded-2xl border border-line bg-panel px-5 py-5 hover:border-ink/20"
                >
                  <div>
                    <p className="font-semibold text-ink">{flock.flock_number}</p>
                    <p className="text-sm text-muted">
                      {flock.farm_name} · {flock.shed_name}
                    </p>
                  </div>
                  <span className="text-sm text-sage">Log</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {others.length > 0 && profile.role !== "WORKER" ? (
        <section>
          <h2 className="text-lg font-semibold text-ink">Closed batches</h2>
          <ul className="mt-4 grid gap-3">
            {others.map((flock) => (
              <li key={flock.id}>
                <Link
                  href={`/app/logs/${flock.id}`}
                  className="flex items-center justify-between rounded-2xl border border-line px-5 py-4 text-muted"
                >
                  <span>
                    {flock.flock_number} · {flock.farm_name}
                  </span>
                  <span className="text-sm">View</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
