import type { FlockWithSite } from "@/lib/flocks/types";
import type { DailyLog } from "@/lib/logs/types";

export type MissingLogGroup = {
  farmName: string;
  sheds: { flockId: string; shedName: string }[];
};

export function missingLogsByFarm(
  flocks: FlockWithSite[],
  logs: DailyLog[],
  date: string,
): MissingLogGroup[] {
  const logged = new Set(
    logs.filter((log) => log.log_date === date).map((log) => log.flock_id),
  );
  const groups = new Map<string, MissingLogGroup>();

  for (const flock of flocks) {
    if (flock.status !== "ACTIVE" || logged.has(flock.id)) continue;
    const current = groups.get(flock.farm_id) ?? {
      farmName: flock.farm_name,
      sheds: [],
    };
    current.sheds.push({ flockId: flock.id, shedName: flock.shed_name });
    groups.set(flock.farm_id, current);
  }

  return [...groups.values()];
}
