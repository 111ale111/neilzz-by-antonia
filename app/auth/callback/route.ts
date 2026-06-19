import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, isAdminUser } from "@/lib/auth/admin";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/account";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profile = await ensureProfile(user);
      const safeNext = next.startsWith("/") ? next : "/account";
      const target = isAdminUser(user, profile) ? "/dashboard" : safeNext;
      return NextResponse.redirect(new URL(target, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
