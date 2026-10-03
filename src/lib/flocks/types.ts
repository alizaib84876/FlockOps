export type FlockStatus = "ACTIVE" | "HARVESTED" | "CLOSED";

export type Flock = {
  id: string;
  shed_id: string;
  flock_number: string;
  placement_date: string;
  initial_birds: number;
  breed: string | null;
  cost_per_chick: number;
  status: FlockStatus;
  harvest_date: string | null;
  created_at: string;
  updated_at: string;
};

export type FlockWithSite = Flock & {
  shed_name: string;
  shed_capacity: number;
  farm_id: string;
  farm_name: string;
};

export function statusLabel(status: FlockStatus) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "HARVESTED":
      return "Harvested";
    case "CLOSED":
      return "Closed";
  }
}

export function canManageFlocks(role: string) {
  return role === "OWNER" || role === "SUPERVISOR";
}
