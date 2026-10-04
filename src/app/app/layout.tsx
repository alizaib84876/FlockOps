import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AppNav } from "@/components/app/app-nav";
import { FlockOpsMark } from "@/components/brand/flockops-mark";
import { OfflineProvider } from "@/components/offline/offline-provider";
import { SyncBadge } from "@/components/offline/sync-badge";
import { getProfile } from "@/lib/auth/get-profile";
import { roleLabel } from "@/lib/auth/profile";
import { site } from "@/lib/site";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <OfflineProvider>
    <div className="min-h-full bg-background">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Link href="/app" className="block">
              <FlockOpsMark className="h-8 w-8" />
              <span className="sr-only">{site.name}</span>
            </Link>
            <div>
              <p className="text-sm font-semibold text-ink">{site.name}</p>
              <p className="text-xs text-muted">
                {profile?.organization?.name ?? "Workspace"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SyncBadge />
            {profile ? (
              <Link
                href="/app/account"
                className="hidden text-sm text-muted hover:text-ink sm:block"
              >
                {profile.full_name} · {roleLabel(profile.role)}
              </Link>
            ) : null}
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[200px_1fr]">
        <AppNav
          canSeeFarms={profile?.role !== "WORKER"}
          canSeeFinance={profile?.role !== "WORKER"}
          canSeeTeam={profile?.role === "OWNER"}
        />
        <main>{children}</main>
      </div>
    </div>
    </OfflineProvider>
  );
}
