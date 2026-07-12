import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, saved: false, error: "Utilizator neautentificat." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const endpoint: string | undefined = body?.endpoint;
  const p256dh: string | undefined = body?.keys?.p256dh ?? body?.p256dh;
  const auth: string | undefined = body?.keys?.auth ?? body?.auth;
  const userAgent: string | null = body?.userAgent || request.headers.get("user-agent") || null;

  if (!endpoint) {
    return NextResponse.json({ ok: false, saved: false, error: "Lipsește endpoint-ul subscripției." }, { status: 400 });
  }
  if (!p256dh || !auth) {
    return NextResponse.json({ ok: false, saved: false, error: "Lipsesc cheile p256dh / auth." }, { status: 400 });
  }

  // Confirmă că profilul există (profiles.id = user.id)
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  const clientId = profile?.id || user.id;

  const { data, error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        client_id: clientId,
        endpoint,
        p256dh,
        auth,
        user_agent: userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    )
    .select("id")
    .maybeSingle();

  if (error) {
    // Nu raporta succes dacă Supabase a returnat eroare.
    return NextResponse.json({ ok: false, saved: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    saved: true,
    subscriptionId: data?.id ?? null,
    clientId,
  });
}
