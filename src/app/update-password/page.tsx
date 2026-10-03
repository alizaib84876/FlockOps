import Link from "next/link";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { site } from "@/lib/site";

export const metadata = {
  title: "Update password",
};

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-8 shadow-[0_24px_60px_rgba(22,32,23,0.08)]">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← {site.name}
        </Link>
        <h1 className="display mt-6 text-3xl text-ink">New password</h1>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
