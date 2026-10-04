import Link from "next/link";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { site } from "@/lib/site";

export const metadata = {
  title: "Update password",
};

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-8">
      <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-8 shadow-[0_24px_60px_rgba(22,32,23,0.08)]">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← {site.name}
        </Link>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
