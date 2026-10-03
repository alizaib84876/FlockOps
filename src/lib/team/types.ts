export type InviteRole = "SUPERVISOR" | "WORKER";

export type Invite = {
  id: string;
  email: string;
  full_name: string;
  role: InviteRole;
  token: string;
  farm_ids: string[];
  shed_ids: string[];
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
};

export type InvitePreview = {
  organization_name: string;
  invite_role: InviteRole;
  full_name: string;
  email: string;
  expired: boolean;
  accepted: boolean;
};

export type TeamMember = {
  id: string;
  full_name: string;
  phone_number: string | null;
  role: "OWNER" | "SUPERVISOR" | "WORKER";
  is_active: boolean;
  farm_names: string[];
  shed_names: string[];
};
