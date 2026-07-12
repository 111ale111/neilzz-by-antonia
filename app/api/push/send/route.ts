import { NextResponse } from "next/server";
import * as webpush from "web-push";
import { requireAdmin } from "@/lib/auth/admin";

type PushRow = {
  id: string;
  client_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { supabase } = await requireAdmin();
  const payload = await request.json().catch(() => ({}));
  const clientIds = Array.isArray(payload.clientIds) ? payload.clientIds.filter(Boolean) : [];
  const title = String(payload.title || "neilzzbyanto").slice(0, 120);
  const message = String(payload.message || "Ai o notificare nouă.").slice(0, 240);

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  const accounts = clientIds.length;
  const errors: string[] = [];

  if (!publicKey || !privateKey || !subject) {
    return NextResponse.json({
      accounts,
      subscriptionsFound: 0,
      attempted: 0,
      sent: 0,
      failed: 0,
      errors: ["Cheile VAPID nu sunt configurate complet (public, privat, subiect)."],
      error: "Cheile VAPID nu sunt configurate complet.",
    });
  }

  if (accounts === 0) {
    return NextResponse.json({
      accounts: 0,
      subscriptionsFound: 0,
      attempted: 0,
      sent: 0,
      failed: 0,
      errors: [],
      error: "Nu a fost selectat niciun cont.",
    });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, client_id, endpoint, p256dh, auth")
    .in("client_id", clientIds);

  if (error) {
    return NextResponse.json({
      accounts,
      subscriptionsFound: 0,
      attempted: 0,
      sent: 0,
      failed: 0,
      errors: [error.message],
      error: error.message,
    });
  }

  const subscriptions = (data || []) as PushRow[];

  if (subscriptions.length === 0) {
    return NextResponse.json({
      accounts,
      subscriptionsFound: 0,
      attempted: 0,
      sent: 0,
      failed: 0,
      errors: [],
      error: "Nu există niciun dispozitiv abonat pentru conturile selectate.",
    });
  }

  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    subscriptions.map(async (row) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          JSON.stringify({
            title,
            body: message,
            message,
            tag: `neilzz-custom-${Date.now()}`,
            url: "/account?tab=notifications",
          }),
        );
        return true;
      } catch (err: unknown) {
        const statusCode = Number((err as { statusCode?: number })?.statusCode || 0);
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", row.id);
        }
        errors.push(`${row.endpoint.slice(0, 40)}...: ${(err as { body?: string; message?: string })?.body || (err as Error)?.message || "eroare push"}`);
        throw err;
      }
    }),
  );

  for (const result of results) {
    if (result.status === "fulfilled") sent += 1;
    else failed += 1;
  }

  return NextResponse.json({
    accounts,
    subscriptionsFound: subscriptions.length,
    attempted: subscriptions.length,
    sent,
    failed,
    errors,
  });
}
