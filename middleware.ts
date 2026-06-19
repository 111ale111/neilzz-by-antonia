import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

function adminEmails() {
  return [process.env.ADMIN_EMAIL, process.env.NEXT_PUBLIC_ADMIN_EMAIL, process.env.NEXT_PUBLIC_ADMIN_EMAILS]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    let { data: profile } = await supabase.from("profiles").select("role,email").eq("id", user.id).maybeSingle();
    if (!profile && user.email) {
      const retry = await supabase.from("profiles").select("role,email").ilike("email", user.email).maybeSingle();
      profile = retry.data;
    }
    const email = (user.email || profile?.email || "").toLowerCase();
    const role = typeof user.user_metadata?.role === "string" ? user.user_metadata.role : "";
    const isAdmin = profile?.role === "admin" || role === "admin" || adminEmails().includes(email);
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/dashboard" : "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
