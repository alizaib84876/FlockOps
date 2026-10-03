import { createClient } from "@/lib/supabase/server";
import type { FlockStatus, FlockWithSite } from "@/lib/flocks/types";

type NestedFarm = { id: string; name: string };
type NestedShed = {
  id: string;
  name: string;
  capacity: number;
  farm_id: string;
  farms: NestedFarm | NestedFarm[] | null;
};

type FlockRow = {
  id: string;
  shed_id: string;
  flock_number: string;
  placement_date: string;
  initial_birds: number;
  breed: string | null;
  cost_per_chick: number | string;
  status: FlockStatus;
  harvest_date: string | null;
  created_at: string;
  updated_at: string;
  sheds: NestedShed | NestedShed[] | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapFlock(row: FlockRow): FlockWithSite | null {
  const shed = first(row.sheds);
  if (!shed) return null;
  const farm = first(shed.farms);

  return {
    id: row.id,
    shed_id: row.shed_id,
    flock_number: row.flock_number,
    placement_date: row.placement_date,
    initial_birds: row.initial_birds,
    breed: row.breed,
    cost_per_chick: Number(row.cost_per_chick),
    status: row.status,
    harvest_date: row.harvest_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    shed_name: shed.name,
    shed_capacity: shed.capacity,
    farm_id: farm?.id ?? shed.farm_id,
    farm_name: farm?.name ?? "",
  };
}

const flockSelect =
  "id, shed_id, flock_number, placement_date, initial_birds, breed, cost_per_chick, status, harvest_date, created_at, updated_at, sheds(id, name, capacity, farm_id, farms(id, name))";

export async function listFlocks(): Promise<FlockWithSite[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flocks")
    .select(flockSelect)
    .order("placement_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const flocks = ((data ?? []) as unknown as FlockRow[])
    .map(mapFlock)
    .filter((flock): flock is FlockWithSite => flock !== null);

  const missingFarmIds = [
    ...new Set(flocks.filter((flock) => !flock.farm_name).map((flock) => flock.farm_id)),
  ];
  if (missingFarmIds.length === 0) return flocks;

  const { data: farms } = await supabase
    .from("farms")
    .select("id, name")
    .in("id", missingFarmIds);
  const names = new Map(
    (farms ?? []).map((farm) => [String(farm.id), String(farm.name)]),
  );

  return flocks.map((flock) => ({
    ...flock,
    farm_name: flock.farm_name || names.get(flock.farm_id) || "Farm",
  }));
}

export async function getFlock(flockId: string): Promise<FlockWithSite | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flocks")
    .select(flockSelect)
    .eq("id", flockId)
    .maybeSingle();

  if (error || !data) return null;
  const mapped = mapFlock(data as unknown as FlockRow);
  if (!mapped) return null;
  if (mapped.farm_name) return mapped;
  const { data: farm } = await supabase
    .from("farms")
    .select("name")
    .eq("id", mapped.farm_id)
    .maybeSingle();
  return { ...mapped, farm_name: farm?.name ? String(farm.name) : "Farm" };
}

export async function getActiveFlockIdByShed(shedId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flocks")
    .select("id")
    .eq("shed_id", shedId)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}
