export type UserRole = "OWNER" | "SUPERVISOR" | "WORKER";

export type MembershipStatus = "ACTIVE" | "INVITED" | "DISABLED";

export type Profile = {
  id: string;
  organization_id: string;
  full_name: string;
  phone_number: string | null;
  role: UserRole;
  status: MembershipStatus;
  is_active: boolean;
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export function roleLabel(role: UserRole) {
  switch (role) {
    case "OWNER":
      return "Owner";
    case "SUPERVISOR":
      return "Supervisor";
    case "WORKER":
      return "Worker";
  }
}
