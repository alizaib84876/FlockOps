import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { site } from "@/lib/site";

const capabilities = [
  {
    title: "Field logging that survives dead zones",
    body: "Supervisors and shed workers record mortality, feed, and water on large numeric controls. Entries queue locally and sync when the network returns.",
  },
  {
    title: "Numbers you can defend",
    body: "Every change to a daily log stores who edited it, the previous value, the new value, the timestamp, and a mandatory reason. Audit history is insert-only.",
  },
  {
    title: "Owner visibility without noise",
    body: "Switch farms, inspect batch economics, and catch operational drift. Workers never see financials. Supervisors never see owner net profit.",
  },
];

const roles = [
  {
    role: "Owner",
    access: "All farms, sales, margins, users, and the full audit trail.",
  },
  {
    role: "Supervisor",
    access: "Assigned farms: batches, daily logs, expenses, operational summaries.",
  },
  {
    role: "Worker",
    access: "Assigned sheds only. Last 48 hours of logs. No financial screens.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
              Commercial poultry operations
            </p>
            <h1 className="display mt-4 max-w-xl text-5xl leading-[1.05] text-ink sm:text-6xl">
              {site.tagline}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
              Replace notepad logging across sheds with a professional operations
              system: mobile-first entry, offline resilience, and board-ready
              flock economics.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/signup"
                className="rounded-full bg-sage-deep px-5 py-3 text-sm font-medium text-panel hover:bg-sage"
              >
                Create a workspace
              </a>
              <a
                href="/login"
                className="rounded-full border border-line bg-panel px-5 py-3 text-sm font-medium text-ink hover:border-ink/20"
              >
                Sign in
              </a>
            </div>
          </div>
          <aside className="rounded-2xl border border-line bg-panel p-6 shadow-[0_24px_60px_rgba(22,32,23,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Today · Shed 4
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {[
                ["Mortality", "3"],
                ["Sick / culled", ""],
                ["Feed (kg)", "184.0"],
                ["Water (L)", "920"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-line bg-background px-4 py-4"
                >
                  <p className="text-xs text-muted">{label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-sage-deep px-4 py-3 text-sm text-panel">
              <span>Queued locally</span>
              <span className="rounded-full bg-amber px-2.5 py-1 text-xs font-semibold text-ink">
                Pending sync
              </span>
            </div>
          </aside>
        </section>

        <section id="product" className="border-y border-line bg-panel">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3">
            {capabilities.map((item) => (
              <article key={item.title}>
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="operations" className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="display text-3xl text-ink">Role-accurate access</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Permissions follow the farm, not a generic admin toggle. Financial
            screens stay with ownership. Field work stays fast.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {roles.map((item) => (
              <article
                key={item.role}
                className="rounded-2xl border border-line bg-panel p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                  {item.role}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted">{item.access}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
