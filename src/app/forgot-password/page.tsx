import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { site } from "@/lib/site";

export const metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-8 shadow-[0_24px_60px_rgba(22,32,23,0.08)]">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← {site.name}
        </Link>
        <h1 className="display mt-6 text-3xl text-ink">Forgot password</h1>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
