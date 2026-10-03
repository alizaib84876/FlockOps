import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
          Settings
        </p>
        <h1 className="display mt-2 text-4xl text-ink">Account</h1>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold text-ink">Profile</h2>
        <p className="mt-2 text-sm text-muted">{user?.email}</p>
        <div className="mt-5">
          <ProfileForm
            fullName={profile.full_name}
            phoneNumber={profile.phone_number}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold text-ink">Password</h2>
        <div className="mt-5">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
