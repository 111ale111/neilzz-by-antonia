"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { galleryItems as fallbackGalleryItems, instagramHandle, instagramUrl } from "@/lib/mock-data";

type GalerieImage = {
  id: string;
  title: string | null;
  image_url: string;
  position: number | null;
};

export function GalerieSection() {
  const [items, setItems] = useState<GalerieImage[]>([]);

  useEffect(() => {
    async function loadGalerie() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, title, image_url, position")
        .eq("is_visible", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setItems(data);
      }
    }

    loadGalerie();
  }, []);

  const displayItems =
    items.length > 0
      ? items
      : fallbackGalleryItems.map((item, index) => ({
          id: item.id,
          title: item.category,
          image_url: item.src,
          position: index,
        }));

  return (
    <section id="gallery" className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mx-auto max-w-lg text-center">
          <Badge>Galerie</Badge>
          <h2 className="mt-4 font-display text-3xl text-ink dark:text-pearl sm:text-4xl">
            A small window into the studio.
          </h2>
          <p className="mt-3 font-body text-sm text-ink/60 dark:text-pearl/60 sm:text-base">
            The full archive lives on Instagram — this is a hand-picked
            preview.
          </p>
        </div>

        <div className="mt-12 columns-2 gap-4 sm:columns-3">
          {displayItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.07 }}
              className="group relative mb-4 break-inside-avoid overflow-hidden rounded-3xl"
            >
              <div className={i % 2 === 0 ? "relative aspect-[4/5]" : "relative aspect-square"}>
                <Image
                  src={item.image_url}
                  alt={item.title || "neilzzbyanto gallery image"}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 translate-y-2 font-body text-xs font-medium text-pearl opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.title || "neilzzbyanto"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
              <Camera className="h-4 w-4" />
              See the rest on {instagramHandle}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}