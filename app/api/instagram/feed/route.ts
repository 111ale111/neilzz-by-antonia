import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Cache la nivel de server: reîmprospătare la 10 minute (nu cere la fiecare render).
export const revalidate = 600;

type InstagramItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
};

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  // Nu este configurat -> semnalăm clientului să folosească fallback-ul.
  if (!token || !userId) {
    return NextResponse.json({ configured: false, items: [] as InstagramItem[] });
  }

  try {
    const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
    const url = `https://graph.instagram.com/${userId}/media?fields=${fields}&limit=6&access_token=${token}`;
    // Cache-ul e controlat de `export const revalidate = 600` la nivel de rută.
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ configured: true, items: [] as InstagramItem[], error: "instagram_error" });
    }

    const data = (await res.json()) as { data?: InstagramItem[] };
    const items = (data.data || []).slice(0, 6);
    return NextResponse.json({ configured: true, items });
  } catch {
    // Nu lăsăm eroarea să crape aplicația — clientul va folosi fallback-ul.
    return NextResponse.json({ configured: true, items: [] as InstagramItem[], error: "instagram_fetch_failed" });
  }
}
