import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveFarmButton } from "@/components/farms/archive-farm-button";
import { CreateShedForm } from "@/components/farms/create-shed-form";
import { EditFarmForm } from "@/components/farms/edit-farm-form";
import { EditShedForm } from "@/components/farms/edit-shed-form";
import { requireProfile } from "@/lib/auth/require-profile";
import { getFarm } from "@/lib/farms/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ farmId: string }>;
}): Promise<Metadata> {
  const { farmId } = await params;
  const farm = await getFarm(farmId);
  return { title: farm?.name ?? "Farm" };
}

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ farmId: string }>;
}) {
  const profile = await requireProfile();
  const { farmId } = await params;
  const farm = await getFarm(farmId);
  if (!farm) notFound();

  const isOwner = profile.role === "OWNER";
  const totalCapacity = farm.sheds.reduce((sum, shed) => sum + shed.capacity, 0);

  return (
    <div className="space-y-10">
      <div>
        <Link href="/app/farms" className="text-sm text-muted hover:text-ink">
          ← Farms
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="display text-4xl text-ink">{farm.name}</h1>
            <p className="mt-2 text-muted">
              {farm.location || "No location set"} · {farm.sheds.length} sheds ·{" "}
              {totalCapacity.toLocaleString()} bird capacity
            </p>
          </div>
          {farm.archived ? (
            <span className="rounded-full bg-line px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Archived
            </span>
          ) : null}
        </div>
      </div>

      {isOwner ? (
        <section className="rounded-2xl border border-line bg-panel p-6">
          <h2 className="text-lg font-semibold text-ink">Farm details</h2>
          <div className="mt-5">
            <EditFarmForm
              farmId={farm.id}
              name={farm.name}
              location={farm.location}
            />
          </div>
          <div className="mt-6">
            <ArchiveFarmButton farmId={farm.id} archived={farm.archived} />
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold text-ink">Sheds</h2>
        {isOwner && !farm.archived ? (
          <div className="mt-6">
            <CreateShedForm farmId={farm.id} />
          </div>
        ) : null}
        {farm.sheds.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No sheds yet.</p>
        ) : isOwner ? (
          <div className="mt-4">
            {farm.sheds.map((shed) => (
              <EditShedForm key={shed.id} farmId={farm.id} shed={shed} />
            ))}
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-line">
            {farm.sheds.map((shed) => (
              <li key={shed.id} className="flex justify-between py-3 text-sm">
                <span className="font-medium text-ink">{shed.name}</span>
                <span className="text-muted">
                  {shed.capacity.toLocaleString()} birds
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
