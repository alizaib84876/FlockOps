import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { site } from "@/lib/site";

export const metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← {site.name}
        </Link>
        <h1 className="display mt-6 text-4xl text-ink">Terms</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted">
          <p>
            {site.name} is an operations tool for commercial poultry farms. You
            are responsible for the accuracy of numbers entered in your
            workspace and for who you invite.
          </p>
          <p>
            Daily log corrections keep an audit trail. Do not share sign-in
            details. The owner can disable team members.
          </p>
          <p>
            Service availability depends on your network and our hosting
            providers. Offline logging stores entries on the device until they
            sync.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
