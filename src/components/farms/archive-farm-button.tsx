"use client";

import { setFarmArchived } from "@/lib/farms/actions";
import { useState } from "react";

export function ArchiveFarmButton({
  farmId,
  archived,
}: {
  farmId: string;
  archived: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    setError(null);
    const result = await setFarmArchived(farmId, !archived);
    setPending(false);
    if (result.error) setError(result.error);
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="h-12 rounded-full border border-line px-5 text-sm font-medium text-muted hover:text-ink disabled:opacity-60"
      >
        {pending
          ? "Updating…"
          : archived
            ? "Restore farm"
            : "Archive farm"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-copper" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
