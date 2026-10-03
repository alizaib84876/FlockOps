import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditFlockForm } from "@/components/flocks/edit-flock-form";
import { FlockStatusActions } from "@/components/flocks/flock-status-actions";
import { requireProfile } from "@/lib/auth/require-profile";
import { getFlock } from "@/lib/flocks/queries";
import { canManageFlocks, statusLabel } from "@/lib/flocks/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ flockId: string }>;
}): Promise<Metadata> {
  const { flockId } = await params;
  const flock = await getFlock(flockId);
  return { title: flock?.flock_number ?? "Flock" };
}

export default async function FlockDetailPage({
  params,
}: {
  params: Promise<{ flockId: string }>;
}) {
  const profile = await requireProfile();
  const { flockId } = await params;
  const flock = await getFlock(flockId);
  if (!flock) notFound();

  const canManage = canManageFlocks(profile.role);
  const showCost = profile.role !== "WORKER";

  return (
    <div className="space-y-10">
      <div>
        <Link href="/app/flocks" className="text-sm text-muted hover:text-ink">
          ← Flocks
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="display text-4xl text-ink">{flock.flock_number}</h1>
            <p className="mt-2 text-muted">
              {flock.farm_name} · {flock.shed_name} · placed {flock.placement_date}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="rounded-full bg-line px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
              {statusLabel(flock.status)}
            </span>
            <Link
              href={`/app/logs/${flock.id}`}
              className="text-sm font-medium text-sage hover:text-sage-deep"
            >
              Daily log
            </Link>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-xs text-muted">Initial birds</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {flock.initial_birds.toLocaleString()}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-xs text-muted">Shed capacity</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {flock.shed_capacity.toLocaleString()}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-xs text-muted">{showCost ? "Chick cost" : "Breed"}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {showCost
              ? flock.cost_per_chick.toFixed(2)
              : flock.breed || "Not set"}
          </p>
        </article>
      </section>

      {canManage ? (
        <section className="rounded-2xl border border-line bg-panel p-6">
          <h2 className="text-lg font-semibold text-ink">Flock details</h2>
          <div className="mt-5">
            <EditFlockForm flock={flock} />
          </div>
        </section>
      ) : null}

      {canManage && flock.status === "ACTIVE" ? (
        <section className="rounded-2xl border border-line bg-panel p-6">
          <h2 className="text-lg font-semibold text-ink">Finish this batch</h2>
          <div className="mt-5">
            <FlockStatusActions flockId={flock.id} />
          </div>
        </section>
      ) : null}

      {flock.harvest_date ? (
        <p className="text-sm text-muted">Harvested on {flock.harvest_date}.</p>
      ) : null}
    </div>
  );
}
