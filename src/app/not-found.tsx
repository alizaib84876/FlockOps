import Link from "next/link";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center px-5 py-24">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
          404
        </p>
        <h1 className="display mt-3 text-4xl text-ink">Page not found</h1>
        <p className="mt-3 text-muted">
          That address is not in {site.name}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/app"
            className="inline-flex h-12 items-center rounded-full bg-sage-deep px-5 text-sm font-medium text-panel"
          >
            Workspace
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full border border-line bg-panel px-5 text-sm font-medium text-ink"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
