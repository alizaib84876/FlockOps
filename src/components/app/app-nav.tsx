"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

function NavLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <span className="inline-flex items-center gap-2">
      {children}
      {pending ? (
        <span
          aria-hidden
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage"
        />
      ) : null}
    </span>
  );
}

export function AppNav({
  canSeeFarms,
  canSeeFinance,
  canSeeTeam,
}: {
  canSeeFarms: boolean;
  canSeeFinance: boolean;
  canSeeTeam: boolean;
}) {
  const pathname = usePathname();
  const items = [
    { href: "/app", label: "Overview" },
    ...(canSeeFarms ? [{ href: "/app/farms", label: "Farms & sheds" }] : []),
    ...(canSeeFarms ? [{ href: "/app/flocks", label: "Flocks" }] : []),
    { href: "/app/logs", label: "Daily logs" },
    ...(canSeeFinance ? [{ href: "/app/expenses", label: "Expenses" }] : []),
    ...(canSeeTeam ? [{ href: "/app/team", label: "Team" }] : []),
    { href: "/app/account", label: "Account" },
  ];

  return (
    <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
      {items.map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-panel text-ink" : "text-muted hover:bg-panel hover:text-ink"
            }`}
          >
            <NavLabel>{item.label}</NavLabel>
          </Link>
        );
      })}
    </nav>
  );
}
