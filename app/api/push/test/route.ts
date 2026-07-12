import { NextResponse } from "next/server";
import * as webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { detectDevice, endpointPreview } from "@/lib/device";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PushRow = {
  id: string;
  client_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
};

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Neautentificat." }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    return NextResponse.json({
      ok: false,
      subscriptionsFound: 0,
      attempted: 0,
      sent: 0,
      failed: 0,
      removedExpired: 0,
      errors: [],
      error: "Cheile VAPID nu sunt configurate complet (public, privat, subiect).",
    });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, client_id, endpoint, p256dh, auth, user_agent")
    .eq("client_id", user.id);

  if (error) {
    return NextResponse.json({ ok: false, subscriptionsFound: 0, attempted: 0, sent: 0, failed: 0, removedExpired: 0, errors: [], error: error.message });
  }

  const subscriptions = (data || []) as PushRow[];

  if (subscriptions.length === 0) {
    return NextResponse.json({
      ok: false,
      subscriptionsFound: 0,
      attempted: 0,
      sent: 0,
      failed: 0,
      removedExpired: 0,
      errors: [],
      error: "Niciun dispozitiv abonat pentru acest cont. Apasă „Reînregistrează dispozitivul”.",
    });
  }

  const payload = JSON.stringify({
    title: "Test Push neilzzbyanto",
    body: "Notificarea Web Push funcționează pe acest dispozitiv.",
    message: "Notificarea Web Push funcționează pe acest dispozitiv.",
    url: "/account?tab=notifications",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "neilzz-push-test",
  });

  let sent = 0;
  let failed = 0;
  let removedExpired = 0;
  const errors: Array<Record<string, unknown>> = [];

  const results = await Promise.allSettled(
    subscriptions.map(async (row) => {
      try {
        await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, payload);
        return true;
      } catch (err: unknown) {
        const statusCode = Number((err as { statusCode?: number })?.statusCode || 0);
        let removed = false;
        if (statusCode === 404 || statusCode === 410) {
          const { data: del } = await supabase.from("push_subscriptions").delete().eq("id", row.id).eq("client_id", user.id).select("id");
          removed = Boolean(del?.length);
          if (removed) removedExpired += 1;
        }
        errors.push({
          subscriptionId: row.id,
          endpointPreview: endpointPreview(row.endpoint),
          userAgent: detectDevice(row.user_agent),
          statusCode,
          message: (err as { body?: string; message?: string })?.body || (err as Error)?.message || "eroare push",
          removedExpired: removed,
        });
        throw err;
      }
    }),
  );

  for (const result of results) {
    if (result.status === "fulfilled") sent += 1;
    else failed += 1;
  }

  return NextResponse.json({
    ok: sent > 0,
    subscriptionsFound: subscriptions.length,
    attempted: subscriptions.length,
    sent,
    failed,
    removedExpired,
    errors,
  });
}
