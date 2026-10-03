import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import type { Profile } from "@/lib/auth/profile";

export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }
  if (!profile.is_active || profile.status === "DISABLED") {
    redirect("/login");
  }
  return profile;
}
