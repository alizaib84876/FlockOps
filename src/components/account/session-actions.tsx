"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SessionActions() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"local" | "global" | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  async function signOut(scope: "local" | "global") {
    setError(null);
    setPending(scope);
    const supabase = createClient();
    const { error: signOutError } = await supabase.auth.signOut({ scope });
    setPending(null);
    if (signOutError) {
      setError(signOutError.message);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Use this if this device is not yours, or if you left a session open
        elsewhere.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => void signOut("local")}
          className="h-12 rounded-full border border-line bg-background px-5 text-sm font-medium text-ink disabled:opacity-60"
        >
          {pending === "local" ? "Signing out…" : "Sign out this device"}
        </button>
        {confirmAll ? (
          <>
            <button
              type="button"
              disabled={pending !== null}
              onClick={() => void signOut("global")}
              className="h-12 rounded-full bg-sage-deep px-5 text-sm font-medium text-panel disabled:opacity-60"
            >
              {pending === "global" ? "Signing out…" : "Sign out all devices"}
            </button>
            <button
              type="button"
              disabled={pending !== null}
              onClick={() => setConfirmAll(false)}
              className="h-12 rounded-full px-5 text-sm font-medium text-muted hover:text-ink disabled:opacity-60"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => setConfirmAll(true)}
            className="h-12 rounded-full border border-line bg-background px-5 text-sm font-medium text-ink disabled:opacity-60"
          >
            Sign out all devices
          </button>
        )}
      </div>
      {error ? (
        <p className="text-sm text-copper" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
