"use client";

import { useActionState, useState } from "react";
import { createInvite, type ActionState } from "@/lib/team/actions";
import type { FarmWithSheds } from "@/lib/farms/types";

const initial: ActionState = {};

export function InviteForm({ farms }: { farms: FarmWithSheds[] }) {
  const activeFarms = farms.filter((farm) => !farm.archived);
  const [role, setRole] = useState<"SUPERVISOR" | "WORKER">("SUPERVISOR");
  const [state, action, pending] = useActionState(createInvite, initial);

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium text-ink">
        Role
        <select
          name="role"
          value={role}
          onChange={(event) =>
            setRole(event.target.value as "SUPERVISOR" | "WORKER")
          }
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        >
          <option value="SUPERVISOR">Supervisor</option>
          <option value="WORKER">Worker</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-ink">
        Full name
        <input
          name="full_name"
          required
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>
      <label className="block text-sm font-medium text-ink">
        Phone
        <input
          name="phone_number"
          type="tel"
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-background px-4 text-base outline-none ring-sage/30 focus:ring-4"
        />
      </label>

      {role === "SUPERVISOR" ? (
        <fieldset className="rounded-xl border border-line p-4">
          <legend className="px-1 text-sm font-medium text-ink">Farms</legend>
          <div className="mt-2 grid gap-2">
            {activeFarms.map((farm) => (
              <label key={farm.id} className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" name="farm_ids" value={farm.id} />
                {farm.name}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <fieldset className="rounded-xl border border-line p-4">
          <legend className="px-1 text-sm font-medium text-ink">Sheds</legend>
          <div className="mt-2 grid gap-3">
            {activeFarms.map((farm) => (
              <div key={farm.id}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {farm.name}
                </p>
                <div className="mt-2 grid gap-2">
                  {farm.sheds.map((shed) => (
                    <label
                      key={shed.id}
                      className="flex items-center gap-2 text-sm text-ink"
                    >
                      <input type="checkbox" name="shed_ids" value={shed.id} />
                      {shed.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {state.error ? (
        <p className="text-sm text-copper" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.inviteUrl ? (
        <div className="rounded-xl border border-line bg-background p-4">
          <p className="text-sm font-medium text-ink">Invite link</p>
          <p className="mt-1 break-all text-sm text-muted">{state.inviteUrl}</p>
          <CopyButton value={state.inviteUrl} />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-sage-deep px-5 text-sm font-medium text-panel disabled:opacity-60"
      >
        {pending ? "Creating invite…" : "Create invite"}
      </button>
    </form>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
      className="mt-3 text-sm font-medium text-sage"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
