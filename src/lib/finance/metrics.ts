import {
  currentLiveBirds,
  feedConversionRatio,
  flockNetProfit,
  mortalityRatePercent,
} from "@/lib/formulas";
import type { Expense, Sale } from "@/lib/finance/types";
import type { FarmWithSheds, Shed } from "@/lib/farms/types";
import type { FlockWithSite } from "@/lib/flocks/types";
import type { DailyLog } from "@/lib/logs/types";

export type FlockMetrics = {
  flock: FlockWithSite;
  liveBirds: number;
  mortalityPct: number;
  feedKg: number;
  birdsSold: number;
  weightSoldKg: number;
  salesRevenue: number;
  flockExpenses: number;
  allocatedOverhead: number;
  chickCost: number;
  fcr: number | null;
  netProfit: number;
};

export function buildFlockMetrics(
  flocks: FlockWithSite[],
  logs: DailyLog[],
  expenses: Expense[],
  sales: Sale[],
): FlockMetrics[] {
  const birdsByFarm = new Map<string, number>();
  for (const flock of flocks) {
    if (flock.status !== "ACTIVE") continue;
    birdsByFarm.set(
      flock.farm_id,
      (birdsByFarm.get(flock.farm_id) ?? 0) + flock.initial_birds,
    );
  }

  const overheadByFarm = new Map<string, number>();
  for (const expense of expenses) {
    if (expense.flock_id) continue;
    overheadByFarm.set(
      expense.farm_id,
      (overheadByFarm.get(expense.farm_id) ?? 0) + expense.amount,
    );
  }

  return flocks.map((flock) => {
    const flockLogs = logs.filter((log) => log.flock_id === flock.id);
    const mortality = flockLogs.reduce((sum, log) => sum + log.mortality, 0);
    const feedKg = flockLogs.reduce((sum, log) => sum + log.feed_consumed_kg, 0);
    const flockSales = sales.filter((sale) => sale.flock_id === flock.id);
    const birdsSold = 0;
    const weightSoldKg = flockSales.reduce(
      (sum, sale) => sum + sale.total_weight_kg,
      0,
    );
    const salesRevenue = flockSales.reduce(
      (sum, sale) => sum + sale.total_amount,
      0,
    );
    const flockExpenses = expenses
      .filter((expense) => expense.flock_id === flock.id)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const farmBirds = birdsByFarm.get(flock.farm_id) ?? 0;
    const allocatedOverhead =
      flock.status === "ACTIVE" && farmBirds > 0
        ? ((overheadByFarm.get(flock.farm_id) ?? 0) * flock.initial_birds) /
          farmBirds
        : 0;
    const chickCost = flock.cost_per_chick * flock.initial_birds;
    const remaining = currentLiveBirds({
      initialBirds: flock.initial_birds,
      mortality,
      birdsSold,
    });

    return {
      flock,
      liveBirds: flock.status === "ACTIVE" ? remaining : 0,
      mortalityPct: mortalityRatePercent({
        initialBirds: flock.initial_birds,
        mortality,
      }),
      feedKg,
      birdsSold,
      weightSoldKg,
      salesRevenue,
      flockExpenses,
      allocatedOverhead,
      chickCost,
      fcr: feedConversionRatio({
        totalFeedKg: feedKg,
        totalLiveWeightSoldKg: weightSoldKg,
      }),
      netProfit: flockNetProfit({
        salesRevenue,
        flockExpenses: flockExpenses + chickCost,
        allocatedMiscExpenses: allocatedOverhead,
      }),
    };
  });
}

export type ShedSnapshot = {
  shed: Shed;
  farmId: string;
  farmName: string;
  active: FlockMetrics | null;
};

export type FarmSnapshot = {
  farmId: string;
  farmName: string;
  location: string | null;
  archived: boolean;
  liveBirds: number;
  activeFlockCount: number;
  currentExpenses: number;
  currentSales: number;
  currentProfit: number;
  sheds: ShedSnapshot[];
  completed: FlockMetrics[];
};

export function buildFarmSnapshots(
  farms: FarmWithSheds[],
  metrics: FlockMetrics[],
  expenses: Expense[],
): FarmSnapshot[] {
  const metricsByFlockFarm = new Map<string, FlockMetrics[]>();
  for (const row of metrics) {
    const list = metricsByFlockFarm.get(row.flock.farm_id) ?? [];
    list.push(row);
    metricsByFlockFarm.set(row.flock.farm_id, list);
  }

  let farmsList = [...farms];
  const farmIds = new Set(farmsList.map((farm) => farm.id));
  for (const row of metrics) {
    if (!farmIds.has(row.flock.farm_id)) {
      farmIds.add(row.flock.farm_id);
      farmsList = [
        ...farmsList,
        {
          id: row.flock.farm_id,
          organization_id: "",
          name: row.flock.farm_name,
          location: null,
          archived: false,
          created_at: "",
          updated_at: "",
          sheds: [
            {
              id: row.flock.shed_id,
              farm_id: row.flock.farm_id,
              name: row.flock.shed_name,
              capacity: row.flock.shed_capacity,
              created_at: "",
              updated_at: "",
            },
          ],
        },
      ];
    }
  }

  return farmsList
    .filter((farm) => !farm.archived)
    .map((farm) => {
      const farmMetrics = metricsByFlockFarm.get(farm.id) ?? [];
      const active = farmMetrics.filter((row) => row.flock.status === "ACTIVE");
      const completed = farmMetrics.filter((row) => row.flock.status !== "ACTIVE");
      const activeIds = new Set(active.map((row) => row.flock.id));
      const currentExpenses = expenses
        .filter(
          (expense) =>
            expense.farm_id === farm.id &&
            (expense.flock_id === null || activeIds.has(expense.flock_id)),
        )
        .reduce((sum, expense) => sum + expense.amount, 0);
      const currentSales = active.reduce((sum, row) => sum + row.salesRevenue, 0);
      const currentProfit = active.reduce((sum, row) => sum + row.netProfit, 0);
      const liveBirds = active.reduce((sum, row) => sum + row.liveBirds, 0);

      const sheds: ShedSnapshot[] = farm.sheds.map((shed) => ({
        shed,
        farmId: farm.id,
        farmName: farm.name,
        active:
          active.find((row) => row.flock.shed_id === shed.id) ?? null,
      }));

      for (const row of active) {
        if (!sheds.some((item) => item.shed.id === row.flock.shed_id)) {
          sheds.push({
            shed: {
              id: row.flock.shed_id,
              farm_id: farm.id,
              name: row.flock.shed_name,
              capacity: row.flock.shed_capacity,
              created_at: "",
              updated_at: "",
            },
            farmId: farm.id,
            farmName: farm.name,
            active: row,
          });
        }
      }

      return {
        farmId: farm.id,
        farmName: farm.name,
        location: farm.location,
        archived: farm.archived,
        liveBirds,
        activeFlockCount: active.length,
        currentExpenses,
        currentSales,
        currentProfit,
        sheds,
        completed,
      };
    });
}
