"use client";

import { useOffline } from "@/components/offline/offline-provider";

export function SyncBadge() {
  const { online, pendingCount, syncing, syncNow } = useOffline();

  if (!online) {
    return (
      <span className="rounded-full bg-amber px-2.5 py-1 text-xs font-semibold text-ink">
        Offline{pendingCount ? ` · ${pendingCount} queued` : ""}
      </span>
    );
  }

  if (pendingCount > 0 || syncing) {
    return (
      <button
        type="button"
        onClick={() => void syncNow()}
        className="rounded-full bg-amber px-2.5 py-1 text-xs font-semibold text-ink"
      >
        {syncing ? "Syncing…" : `Pending sync · ${pendingCount}`}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-2.5 py-1 text-xs font-semibold text-panel">
      <span className="h-1.5 w-1.5 rounded-full bg-panel" />
      Synced
    </span>
  );
}
