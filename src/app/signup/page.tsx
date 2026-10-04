import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { site } from "@/lib/site";
import { getInvitePreview } from "@/lib/team/queries";

export const metadata = {
  title: "Create workspace",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite: inviteToken } = await searchParams;
  const preview = inviteToken ? await getInvitePreview(inviteToken) : null;
  const inviteInvalid =
    Boolean(inviteToken) &&
    (!preview || preview.expired || preview.accepted);

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-8">
      <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-8 shadow-[0_24px_60px_rgba(22,32,23,0.08)]">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← {site.name}
        </Link>
        {inviteInvalid ? (
          <>
            <h1 className="display mt-6 text-3xl text-ink">Join workspace</h1>
            <p className="mt-6 text-sm text-copper">This invite is no longer valid.</p>
          </>
        ) : (
          <SignupForm inviteToken={inviteToken} invite={preview} />
        )}
      </div>
    </div>
  );
}
