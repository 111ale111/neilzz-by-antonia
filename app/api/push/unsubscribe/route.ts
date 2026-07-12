import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, deleted: false, error: "Neautentificat." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const endpoint: string | undefined = body?.endpoint;

  if (!endpoint) {
    return NextResponse.json({ ok: false, deleted: false, error: "Lipsește endpoint-ul." }, { status: 400 });
  }

  // Șterge NUMAI rândul care aparține utilizatorului autentificat.
  const { data, error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("client_id", user.id)
    .eq("endpoint", endpoint)
    .select("id");

  return NextResponse.json({
    ok: !error,
    deleted: Boolean(data?.length),
    error: error?.message ?? null,
  });
}
