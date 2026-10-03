import Link from "next/link";
import { CreateFarmForm } from "@/components/farms/create-farm-form";
import { requireProfile } from "@/lib/auth/require-profile";
import { listFarms } from "@/lib/farms/queries";

export const metadata = {
  title: "Farms & sheds",
};

export default async function FarmsPage() {
  const profile = await requireProfile();
  const farms = await listFarms();
  const isOwner = profile.role === "OWNER";
  const active = farms.filter((farm) => !farm.archived);
  const archived = farms.filter((farm) => farm.archived);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
          Sites
        </p>
        <h1 className="display mt-2 text-4xl text-ink">Farms & sheds</h1>
      </div>

      {isOwner ? (
        <section className="rounded-2xl border border-line bg-panel p-6">
          <h2 className="text-lg font-semibold text-ink">Add a farm</h2>
          <div className="mt-5">
            <CreateFarmForm />
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-ink">Active farms</h2>
        {active.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-panel px-5 py-8 text-sm text-muted">
            No farms yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {active.map((farm) => (
              <li key={farm.id}>
                <Link
                  href={`/app/farms/${farm.id}`}
                  className="flex items-center justify-between rounded-2xl border border-line bg-panel px-5 py-4 hover:border-ink/20"
                >
                  <div>
                    <p className="font-semibold text-ink">{farm.name}</p>
                    <p className="text-sm text-muted">
                      {farm.location || "No location"} · {farm.sheds.length}{" "}
                      {farm.sheds.length === 1 ? "shed" : "sheds"}
                    </p>
                  </div>
                  <span className="text-sm text-sage">Open</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {archived.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-ink">Archived</h2>
          <ul className="mt-4 grid gap-3">
            {archived.map((farm) => (
              <li key={farm.id}>
                <Link
                  href={`/app/farms/${farm.id}`}
                  className="flex items-center justify-between rounded-2xl border border-line px-5 py-4 text-muted"
                >
                  <div>
                    <p className="font-semibold">{farm.name}</p>
                    <p className="text-sm">
                      {farm.sheds.length} {farm.sheds.length === 1 ? "shed" : "sheds"}
                    </p>
                  </div>
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
