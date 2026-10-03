import Link from "next/link";
import { CreateFlockForm, type ShedChoice } from "@/components/flocks/create-flock-form";
import { requireProfile } from "@/lib/auth/require-profile";
import { listFarms } from "@/lib/farms/queries";
import { listFlocks } from "@/lib/flocks/queries";
import { canManageFlocks, statusLabel } from "@/lib/flocks/types";

export const metadata = {
  title: "Flocks",
};

export default async function FlocksPage() {
  const profile = await requireProfile();
  const [farms, flocks] = await Promise.all([listFarms(), listFlocks()]);
  const canManage = canManageFlocks(profile.role);
  const activeIds = new Set(
    flocks.filter((flock) => flock.status === "ACTIVE").map((flock) => flock.shed_id),
  );

  const shedChoices: ShedChoice[] = farms
    .filter((farm) => !farm.archived)
    .flatMap((farm) =>
      farm.sheds.map((shed) => ({
        id: shed.id,
        name: shed.name,
        capacity: shed.capacity,
        farmId: farm.id,
        farmName: farm.name,
        occupied: activeIds.has(shed.id),
      })),
    );

  const year = new Date().getFullYear();
  const placedThisYear = flocks.filter((flock) =>
    flock.placement_date.startsWith(String(year)),
  ).length;
  const suggestedNumber = `FLOCK-${year}-${String(placedThisYear + 1).padStart(2, "0")}`;
  const showCost = profile.role !== "WORKER";

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
          Batches
        </p>
        <h1 className="display mt-2 text-4xl text-ink">Flocks</h1>
      </div>

      {canManage ? (
        <section className="rounded-2xl border border-line bg-panel p-6">
          <h2 className="text-lg font-semibold text-ink">Place a flock</h2>
          {shedChoices.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No sheds available.</p>
          ) : (
            <div className="mt-5">
              <CreateFlockForm
                sheds={shedChoices}
                suggestedNumber={suggestedNumber}
              />
            </div>
          )}
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-ink">All flocks</h2>
        {flocks.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-panel px-5 py-8 text-sm text-muted">
            No flocks yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {flocks.map((flock) => (
              <li key={flock.id}>
                <Link
                  href={`/app/flocks/${flock.id}`}
                  className="flex items-center justify-between rounded-2xl border border-line bg-panel px-5 py-4 hover:border-ink/20"
                >
                  <div>
                    <p className="font-semibold text-ink">{flock.flock_number}</p>
                    <p className="text-sm text-muted">
                      {flock.farm_name} · {flock.shed_name} ·{" "}
                      {flock.initial_birds.toLocaleString()} birds
                      {showCost
                        ? ` · ${flock.cost_per_chick.toFixed(2)} / chick`
                        : ""}
                    </p>
                  </div>
                  <span className="text-sm text-sage">{statusLabel(flock.status)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
