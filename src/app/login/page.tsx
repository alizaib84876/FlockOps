import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { site } from "@/lib/site";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-8">
      <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-8 shadow-[0_24px_60px_rgba(22,32,23,0.08)]">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← {site.name}
        </Link>
        <h1 className="display mt-6 text-3xl text-ink">Sign in</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
