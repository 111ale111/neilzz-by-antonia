"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Camera } from "lucide-react";

type InstagramItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
};

type GalleryImage = { id: string; title: string | null; image_url: string };

function mediaSrc(item: InstagramItem): string | null {
  if (item.media_type === "VIDEO" || item.media_type === "REELS") {
    return item.thumbnail_url || item.media_url || null;
  }
  return item.media_url || item.thumbnail_url || null;
}

export function InstagramFeed({
  galleryImages,
  instagramUrl,
  instagramHandle,
}: {
  galleryImages: GalleryImage[];
  instagramUrl: string;
  instagramHandle: string;
}) {
  const [items, setItems] = useState<InstagramItem[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/instagram/feed")
      .then((r) => r.json())
      .then((d) => {
        if (active && Array.isArray(d.items)) setItems(d.items as InstagramItem[]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const igPosts = items.filter((i) => mediaSrc(i)).slice(0, 6);
  const fallback = galleryImages.slice(0, 6);
  const showIg = igPosts.length > 0;
  const showGallery = !showIg && fallback.length > 0;

  return (
    <section className="relative z-10 px-4 py-12 sm:px-5 md:px-8 md:py-16">
      <div className="home-instagram-shell mx-auto max-w-[1320px] overflow-hidden rounded-[2.2rem] p-5 sm:p-6 md:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="lux-label">Instagram</p>
            <h2 className="editorial-title mt-4 text-4xl leading-[0.95] md:text-6xl">Ultimele postări de pe Instagram</h2>
          </div>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="lux-action lux-action-soft inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            <Camera className="h-4 w-4" /> Vezi profilul pe Instagram
          </a>
        </div>

        {showIg || showGallery ? (
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3">
            {showIg
              ? igPosts.map((post) => {
                  const src = mediaSrc(post) as string;
                  return (
                    <a
                      key={post.id}
                      href={post.permalink || instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-[1.1rem] border border-[var(--line)] bg-[var(--panel)]"
                    >
                      <Image
                        src={src}
                        alt={post.caption?.slice(0, 80) || "Postare Instagram neilzzbyanto"}
                        fill
                        loading="lazy"
                        sizes="(min-width: 768px) 30vw, 45vw"
                        className="object-cover transition duration-500 md:group-hover:scale-105"
                      />
                    </a>
                  );
                })
              : fallback.map((img) => (
                  <a
                    key={img.id}
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-[1.1rem] border border-[var(--line)] bg-[var(--panel)]"
                  >
                    <Image
                      src={img.image_url}
                      alt={img.title || "Lucrare neilzzbyanto"}
                      fill
                      loading="lazy"
                      sizes="(min-width: 768px) 30vw, 45vw"
                      className="object-cover transition duration-500 md:group-hover:scale-105"
                    />
                  </a>
                ))}
          </div>
        ) : (
          <div className="mt-7 rounded-[1.6rem] border border-[var(--line)] bg-[var(--panel)] p-8 text-center">
            <p className="font-serif text-3xl">Vezi lucrările pe Instagram</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">
              Cele mai noi modele apar pe profilul oficial neilzzbyanto.
            </p>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[var(--rose-strong)]"
            >
              {instagramHandle} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
