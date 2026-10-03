import { createClient } from "@/lib/supabase/server";
import type { FarmWithSheds, Shed } from "@/lib/farms/types";

export async function listFarms(): Promise<FarmWithSheds[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("farms")
    .select(
      "id, organization_id, name, location, archived, created_at, updated_at, sheds(id, farm_id, name, capacity, created_at, updated_at)",
    )
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((farm) => ({
    ...farm,
    sheds: (farm.sheds ?? []).sort((a: Shed, b: Shed) =>
      a.name.localeCompare(b.name),
    ),
  })) as FarmWithSheds[];
}

export async function getFarm(farmId: string): Promise<FarmWithSheds | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("farms")
    .select(
      "id, organization_id, name, location, archived, created_at, updated_at, sheds(id, farm_id, name, capacity, created_at, updated_at)",
    )
    .eq("id", farmId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    sheds: (data.sheds ?? []).sort((a: Shed, b: Shed) =>
      a.name.localeCompare(b.name),
    ),
  } as FarmWithSheds;
}

export async function listAssignedSheds(): Promise<
  { id: string; name: string; capacity: number; farm_id: string; farm_name: string }[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_shed_assignments")
    .select("shed_id, sheds(id, name, capacity, farm_id, farms(id, name))")
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => {
      const shedRaw = row.sheds as
        | {
            id: string;
            name: string;
            capacity: number;
            farm_id: string;
            farms: { id: string; name: string } | { id: string; name: string }[] | null;
          }
        | {
            id: string;
            name: string;
            capacity: number;
            farm_id: string;
            farms: { id: string; name: string } | { id: string; name: string }[] | null;
          }[]
        | null;
      const shed = Array.isArray(shedRaw) ? shedRaw[0] : shedRaw;
      if (!shed) return null;
      const farm = Array.isArray(shed.farms) ? shed.farms[0] : shed.farms;
      return {
        id: String(shed.id),
        name: String(shed.name),
        capacity: Number(shed.capacity),
        farm_id: String(farm?.id ?? shed.farm_id),
        farm_name: String(farm?.name ?? "Farm"),
      };
    })
    .filter(
      (
        row,
      ): row is {
        id: string;
        name: string;
        capacity: number;
        farm_id: string;
        farm_name: string;
      } => row !== null,
    );
}
