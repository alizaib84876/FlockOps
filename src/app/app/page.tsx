import Link from "next/link";
import { requireProfile } from "@/lib/auth/require-profile";
import { roleLabel } from "@/lib/auth/profile";
import { listAssignedSheds, listFarms } from "@/lib/farms/queries";
import {
  buildFarmSnapshots,
  buildFlockMetrics,
  type FarmSnapshot,
} from "@/lib/finance/metrics";
import { listExpenses, listSales } from "@/lib/finance/queries";
import { canSeeFinance, canSeeProfit } from "@/lib/finance/types";
import { listFlocks } from "@/lib/flocks/queries";
import { listAllDailyLogs } from "@/lib/logs/all";

export const metadata = {
  title: "Overview",
};

function money(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AppHomePage() {
  const profile = await requireProfile();
  const showFinance = canSeeFinance(profile.role);
  const showProfit = canSeeProfit(profile.role);
  const isWorker = profile.role === "WORKER";

  const [farms, assignedSheds, flocks, logs, expenses, sales] = await Promise.all([
    listFarms(),
    isWorker ? listAssignedSheds() : Promise.resolve([]),
    listFlocks(),
    listAllDailyLogs(),
    showFinance ? listExpenses() : Promise.resolve([]),
    showProfit ? listSales() : Promise.resolve([]),
  ]);

  const metrics = buildFlockMetrics(flocks, logs, expenses, sales);
  const snapshots = isWorker
    ? workerSnapshots(assignedSheds, metrics)
    : buildFarmSnapshots(farms, metrics, expenses);

  const liveBirds = snapshots.reduce((sum, farm) => sum + farm.liveBirds, 0);
  const activeFlockCount = snapshots.reduce(
    (sum, farm) => sum + farm.activeFlockCount,
    0,
  );
  const currentProfit = snapshots.reduce(
    (sum, farm) => sum + farm.currentProfit,
    0,
  );
  const currentExpenses = snapshots.reduce(
    (sum, farm) => sum + farm.currentExpenses,
    0,
  );

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
          {isWorker ? "My sheds" : showProfit ? "Owner dashboard" : "Farm operations"}
        </p>
        <h1 className="display mt-2 text-4xl text-ink">
          Welcome, {profile.full_name}
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          {roleLabel(profile.role)} · {profile.organization?.name ?? "Workspace"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-xs text-muted">Live birds</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {liveBirds.toLocaleString()}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-xs text-muted">Active flocks</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {activeFlockCount}
            {isWorker ? "" : ` · ${snapshots.length} farms`}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-xs text-muted">
            {showProfit
              ? "Current net profit"
              : showFinance
                ? "Current expenses"
                : "Today"}
          </p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {showProfit
              ? money(currentProfit)
              : showFinance
                ? money(currentExpenses)
                : "—"}
          </p>
        </article>
      </div>

      {snapshots.length === 0 ? (
        <p className="text-sm text-muted">
            {isWorker ? "No sheds assigned." : "No farms yet."}
        </p>
      ) : (
        <div className="grid gap-6">
          {snapshots.map((farm) => (
            <FarmCard
              key={farm.farmId}
              farm={farm}
              showFinance={showFinance}
              showProfit={showProfit}
              isWorker={isWorker}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/app/logs"
          className="inline-flex h-12 items-center rounded-full bg-sage-deep px-5 text-sm font-medium text-panel"
        >
          Daily logs
        </Link>
        {showFinance ? (
          <Link
            href="/app/expenses"
            className="inline-flex h-12 items-center rounded-full border border-line bg-panel px-5 text-sm font-medium text-ink"
          >
            Expenses
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function FarmCard({
  farm,
  showFinance,
  showProfit,
  isWorker,
}: {
  farm: FarmSnapshot;
  showFinance: boolean;
  showProfit: boolean;
  isWorker: boolean;
}) {
  return (
    <section className="rounded-2xl border border-line bg-panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">{farm.farmName}</h2>
          <p className="mt-1 text-sm text-muted">
            {farm.liveBirds.toLocaleString()} live · {farm.activeFlockCount}{" "}
            active
            {farm.location ? ` · ${farm.location}` : ""}
          </p>
        </div>
        {!isWorker ? (
          <Link
            href={`/app/farms/${farm.farmId}`}
            className="text-sm font-medium text-sage"
          >
            Farm setup
          </Link>
        ) : null}
      </div>

      {showFinance ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <p className="text-sm text-muted">
            Expenses{" "}
            <span className="font-medium text-ink">{money(farm.currentExpenses)}</span>
          </p>
          {showProfit ? (
            <>
              <p className="text-sm text-muted">
                Sales{" "}
                <span className="font-medium text-ink">{money(farm.currentSales)}</span>
              </p>
              <p className="text-sm text-muted">
                Profit{" "}
                <span className="font-medium text-ink">{money(farm.currentProfit)}</span>
              </p>
            </>
          ) : null}
        </div>
      ) : null}

      <ul className="mt-5 divide-y divide-line">
        {farm.sheds.map((row) => (
          <li key={row.shed.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium text-ink">{row.shed.name}</p>
              {row.active ? (
                <p className="text-sm text-muted">
                  {row.active.flock.flock_number} ·{" "}
                  {row.active.liveBirds.toLocaleString()} live · mortality{" "}
                  {row.active.mortalityPct.toFixed(1)}%
                </p>
              ) : (
                <p className="text-sm text-muted">No active flock</p>
              )}
            </div>
            {row.active ? (
              <Link
                href={`/app/logs/${row.active.flock.id}`}
                className="text-sm font-medium text-sage"
              >
                Log
              </Link>
            ) : null}
          </li>
        ))}
      </ul>

      {farm.completed.length > 0 && !isWorker ? (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Completed batches
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {farm.completed.map((row) => (
              <li key={row.flock.id}>
                {row.flock.flock_number} · {row.flock.shed_name} · 0 live
                {showProfit ? ` · closed P&L ${money(row.netProfit)}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function workerSnapshots(
  assignedSheds: {
    id: string;
    name: string;
    capacity: number;
    farm_id: string;
    farm_name: string;
  }[],
  metrics: ReturnType<typeof buildFlockMetrics>,
): FarmSnapshot[] {
  const sheds = assignedSheds.map((shed) => ({
    id: shed.id,
    farm_id: shed.farm_id,
    name: shed.name,
    capacity: shed.capacity,
    created_at: "",
    updated_at: "",
  }));

  const farms = [...new Map(assignedSheds.map((shed) => [shed.farm_id, shed])).values()].map(
    (shed) => ({
      id: shed.farm_id,
      organization_id: "",
      name: shed.farm_name,
      location: null,
      archived: false,
      created_at: "",
      updated_at: "",
      sheds: sheds.filter((item) => item.farm_id === shed.farm_id),
    }),
  );

  if (farms.length > 0) {
    return buildFarmSnapshots(farms, metrics, []);
  }

  return buildFarmSnapshots([], metrics, []);
}