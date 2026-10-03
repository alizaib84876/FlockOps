import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { site } from "@/lib/site";

export const metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← {site.name}
        </Link>
        <h1 className="display mt-6 text-4xl text-ink">Privacy</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted">
          <p>
            {site.name} stores farm operations data you enter: account details,
            flock records, daily logs, expenses, and sales. That data is used
            only to run your workspace.
          </p>
          <p>
            Access follows your role. Workers do not see financial records.
            Unauthenticated visitors cannot read farm data.
          </p>
          <p>
            Authentication is handled by our hosted database provider. Reset
            links are sent to the email on the account.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
