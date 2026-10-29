import Link from "next/link";
import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { SessionActions } from "@/components/account/session-actions";
import { requireProfile } from "@/lib/auth/require-profile";
import { roleLabel } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Account",
};

function formatWhen(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(date);
}

export default async function AccountPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? "";

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
          Settings
        </p>
        <h1 className="display mt-2 text-4xl text-ink">Account</h1>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold text-ink">Workspace</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Organization</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {profile.organization?.name ?? "Workspace"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Role</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {roleLabel(profile.role)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Signed in</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {formatWhen(user?.last_sign_in_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Member since</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {formatWhen(user?.created_at)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold text-ink">Profile</h2>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-ink">
            Email
            <input
              value={email}
              readOnly
              className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base text-muted"
            />
          </label>
          <ProfileForm
            fullName={profile.full_name}
            phoneNumber={profile.phone_number}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold text-ink">Password</h2>
        <p className="mt-2 text-sm text-muted">
          Current password is required. Other devices will be signed out.
        </p>
        <div className="mt-5">
          {email ? (
            <PasswordForm email={email} />
          ) : (
            <p className="text-sm text-muted">No email on this account.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold text-ink">Devices</h2>
        <div className="mt-5">
          <SessionActions />
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold text-ink">Legal</h2>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link href="/privacy" className="font-medium text-sage hover:text-sage-deep">
            Privacy
          </Link>
          <Link href="/terms" className="font-medium text-sage hover:text-sage-deep">
            Terms
          </Link>
        </div>
      </section>
    </div>
  );
}
