import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/app";
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));
  const keepSession = next === "/update-password";
  const destination = keepSession
    ? `${origin}${next}`
    : `${origin}/login?verified=1`;

  let redirectResponse = NextResponse.redirect(destination);
  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        redirectResponse = NextResponse.redirect(destination);
        cookiesToSet.forEach(({ name, value, options }) =>
          redirectResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/forgot-password`);
    }
    if (!keepSession) {
      await supabase.auth.signOut();
    }
    return redirectResponse;
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(`${origin}/forgot-password`);
    }
    if (!keepSession) {
      await supabase.auth.signOut();
    }
    return redirectResponse;
  }

  return NextResponse.redirect(`${origin}/login`);
}
