export type Farm = {
  id: string;
  organization_id: string;
  name: string;
  location: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type Shed = {
  id: string;
  farm_id: string;
  name: string;
  capacity: number;
  created_at: string;
  updated_at: string;
};

export type FarmWithSheds = Farm & {
  sheds: Shed[];
};
