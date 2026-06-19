"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookmarkPlus, Camera, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";

const INSTAGRAM_URL = "https://instagram.com/neilzz_by.anto";

type GalerieImage = {
  id: string;
  title: string | null;
  image_url: string;
  position: number | null;
};

const fallbackGalerie: GalerieImage[] = [
  { id: "fallback-1", title: "Signature Finish", image_url: "https://picsum.photos/seed/neilzz-gallery-1/1300/1700", position: 1 },
  { id: "fallback-2", title: "Soft Detail", image_url: "https://picsum.photos/seed/neilzz-gallery-2/1300/1500", position: 2 },
  { id: "fallback-3", title: "Clean Shape", image_url: "https://picsum.photos/seed/neilzz-gallery-3/1300/1800", position: 3 },
  { id: "fallback-4", title: "Gloss Set", image_url: "https://picsum.photos/seed/neilzz-gallery-4/1300/1600", position: 4 },
  { id: "fallback-5", title: "Minimal Art", image_url: "https://picsum.photos/seed/neilzz-gallery-5/1300/1700", position: 5 },
  { id: "fallback-6", title: "Quiet Luxury", image_url: "https://picsum.photos/seed/neilzz-gallery-6/1300/1550", position: 6 },
];

function Sparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="sparkle left-[15%] top-[20%]" />
      <span className="sparkle right-[18%] top-[30%] [animation-delay:1.7s]" />
      <span className="sparkle bottom-[18%] left-[42%] [animation-delay:3.2s]" />
    </div>
  );
}

export default function GaleriePage() {
  const [items, setItems] = useState<GalerieImage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    async function loadGalerie() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id,title,image_url,position")
        .eq("is_visible", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) setItems(data);
    }

    loadGalerie();
  }, []);

  const displayItems = useMemo(() => (items.length > 0 ? items : fallbackGalerie), [items]);
  const activeItem = activeIndex === null ? null : displayItems[activeIndex];

  function goNext() {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % displayItems.length);
  }

  function goPrev() {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + displayItems.length) % displayItems.length);
  }


  async function saveToInspirations(item: GalerieImage) {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      window.location.href = "/login";
      return;
    }
    const { error } = await supabase.from("client_inspirations").insert({
      client_id: auth.user.id,
      image_url: item.image_url,
      title: item.title || "Saved from gallery",
      source_type: "gallery",
      source_gallery_id: item.id.startsWith("fallback") ? null : item.id,
    });
    setSaveMessage(error ? error.message : "Saved to My Inspirations.");
    setTimeout(() => setSaveMessage(""), 2400);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (activeIndex === null) return;
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, displayItems.length]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-5 pb-24 pt-28 text-[var(--text)] md:px-8 md:pt-32">
      <SiteHeader />
      <div className="lux-noise" />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="soft-pulse absolute left-[8%] top-[4%] h-72 w-72 rounded-full bg-[var(--wine)]/42 blur-[130px]" />
        <div className="soft-pulse absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-[var(--rose)]/12 blur-[140px]" />
      </div>
      <Sparkles />

      <div className="relative z-10 mx-auto max-w-[1500px]">
        {saveMessage && <div className="fixed bottom-24 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-[var(--line)] bg-[var(--panel-strong)] px-5 py-3 text-sm text-[var(--text)] backdrop-blur-2xl">{saveMessage}</div>}

        <section className="pb-12 pt-14 text-center md:pb-16 md:pt-20">
          <p className="lux-label">neilzzbyanto portfolio</p>
          <h1 className="editorial-title mx-auto mt-5 max-w-4xl text-6xl leading-[0.9] md:text-8xl">
            Quiet work.
            <br /> Clean finish.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[var(--muted)]">
            O selecție curată de lucrări. Apasă pe orice imagine pentru preview fullscreen.
          </p>
        </section>

        <section className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {displayItems.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.72, delay: (index % 5) * 0.05 }}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-2.5 text-left shadow-[0_28px_90px_var(--shadow)] backdrop-blur-2xl md:rounded-[2.3rem]"
            >
              <div className={index % 3 === 1 ? "relative aspect-square overflow-hidden rounded-[1.45rem]" : "relative aspect-[4/5] overflow-hidden rounded-[1.45rem]"}>
                <Image src={item.image_url} alt={item.title || "neilzzbyanto gallery"} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover opacity-90 saturate-[0.92] transition duration-1000 group-hover:scale-[1.035]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/5 to-transparent opacity-65 transition duration-500 group-hover:opacity-90" />
                <button type="button" onClick={(event) => { event.stopPropagation(); saveToInspirations(item); }} className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-xs font-semibold text-white backdrop-blur-xl transition hover:bg-white/15">
                  <BookmarkPlus className="h-4 w-4" /> Save
                </button>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.38em] text-white/45">set</p>
                    <p className="mt-1 font-serif text-2xl text-white">{item.title || "neilzzbyanto"}</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white opacity-0 backdrop-blur-xl transition group-hover:opacity-100">
                    <Maximize2 className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </section>
      </div>

      <AnimatePresence>
        {activeItem && activeIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/82 p-4 backdrop-blur-2xl md:p-8">
            <button onClick={() => setActiveIndex(null)} className="absolute right-5 top-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl">
              <X className="h-5 w-5" />
            </button>
            <button onClick={goPrev} className="absolute left-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl md:left-8">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={goNext} className="absolute right-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl md:right-8">
              <ChevronRight className="h-5 w-5" />
            </button>

            <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }} className="relative mx-auto flex h-full max-w-5xl items-center justify-center">
              <div className="relative h-[82vh] w-full overflow-hidden rounded-[2rem] border border-white/12 bg-white/5 shadow-[0_40px_160px_rgba(0,0,0,.75)]">
                <Image src={activeItem.image_url} alt={activeItem.title || "neilzzbyanto gallery"} fill sizes="100vw" className="object-contain" />
              </div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/12 bg-black/35 px-5 py-3 text-sm text-white/80 backdrop-blur-xl">
                {activeItem.title || "neilzzbyanto"} · {activeIndex + 1}/{displayItems.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
