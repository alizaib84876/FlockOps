"use client";

import { revokeInvite, setMemberActive } from "@/lib/team/actions";
import { useState } from "react";

export function CopyInviteButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const url = `${window.location.origin}/signup?invite=${token}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }}
      className="text-sm font-medium text-sage"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

export function RevokeInviteButton({ inviteId }: { inviteId: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          const result = await revokeInvite(inviteId);
          if (result.error) setError(result.error);
        }}
        className="text-sm font-medium text-copper"
      >
        Revoke
      </button>
      {error ? <p className="text-xs text-copper">{error}</p> : null}
    </div>
  );
}

export function MemberStatusButton({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          const result = await setMemberActive(userId, !isActive);
          if (result.error) setError(result.error);
        }}
        className="text-sm font-medium text-sage"
      >
        {isActive ? "Disable" : "Restore"}
      </button>
      {error ? <p className="text-xs text-copper">{error}</p> : null}
    </div>
  );
}
