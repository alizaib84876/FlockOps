import Link from "next/link";
import { FlockOpsMark } from "@/components/brand/flockops-mark";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <FlockOpsMark className="h-8 w-8" />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            {site.name}
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <a href="#product" className="hidden hover:text-ink sm:inline">
            Product
          </a>
          <a href="#operations" className="hidden hover:text-ink sm:inline">
            Operations
          </a>
          <Link href="/signup" className="hidden hover:text-ink sm:inline">
            Create workspace
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-sage-deep px-4 py-2 text-sm font-medium text-panel hover:bg-sage"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
