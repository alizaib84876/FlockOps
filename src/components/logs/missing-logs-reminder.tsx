import Link from "next/link";
import type { MissingLogGroup } from "@/lib/logs/missing";

export function MissingLogsReminder({
  date,
  groups,
}: {
  date: string;
  groups: MissingLogGroup[];
}) {
  if (groups.length === 0) return null;

  return (
    <section className="rounded-2xl border border-copper/30 bg-panel p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
        Reminder
      </p>
      <h2 className="mt-2 text-lg font-semibold text-ink">
        Today’s logs are still due
      </h2>
      <p className="mt-1 text-sm text-muted">{date}</p>
      <ul className="mt-4 space-y-3">
        {groups.map((group) => (
          <li key={group.farmName}>
            <p className="font-medium text-ink">Farm — {group.farmName}</p>
            <ul className="mt-1 space-y-1">
              {group.sheds.map((shed) => (
                <li key={shed.flockId}>
                  <Link
                    href={`/app/logs/${shed.flockId}`}
                    className="text-sm text-sage hover:text-sage-deep"
                  >
                    {shed.shedName} has no log yet
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
