"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type GalerieImage = {
  id: string;
  title: string | null;
  image_url: string;
  storage_path: string;
  position: number | null;
  is_visible: boolean | null;
};

export function GalleryUploader() {
  const supabase = createClient();

  const [images, setImages] = useState<GalerieImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadImages() {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setImages(data);
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setMessage("Choose an image first.");
      return;
    }

    setLoading(true);
    setMessage("");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("gallery").upload(fileName, file);

    if (uploadError) {
      setLoading(false);
      setMessage(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("gallery").getPublicUrl(fileName);

    const { error: dbError } = await supabase.from("gallery_images").insert({
      title: title || "neilzzbyanto",
      image_url: publicUrlData.publicUrl,
      storage_path: fileName,
      is_visible: true,
    });

    setLoading(false);

    if (dbError) {
      setMessage(dbError.message);
      return;
    }

    setFile(null);
    setTitle("");
    setMessage("Image uploaded successfully.");
    await loadImages();
  }

  async function handleDelete(image: GalerieImage) {
    const confirmed = window.confirm("Delete this image?");
    if (!confirmed) return;

    await supabase.storage.from("gallery").remove([image.storage_path]);
    await supabase.from("gallery_images").delete().eq("id", image.id);
    await loadImages();
  }

  return (
    <div className="space-y-7">
      <form onSubmit={handleUpload} className="admin-card rounded-[1.8rem] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="lux-label">Upload</p>
            <h2 className="mt-3 font-serif text-3xl md:text-[2.6rem]">New Image</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Add a clean portfolio photo for homepage and gallery.</p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel-strong)] text-[var(--rose-strong)]">
            <UploadCloud className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <input
            className="h-14 rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_78%,transparent)] px-5 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--faint)] focus:border-[var(--rose)]"
            placeholder="Image title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="group flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[color-mix(in_srgb,var(--rose)_42%,var(--line))] bg-[color-mix(in_srgb,var(--bg)_74%,transparent)] px-5 py-6 text-center transition hover:bg-[var(--panel-strong)]">
            <UploadCloud className="h-6 w-6 text-[var(--rose-strong)] transition group-hover:-translate-y-0.5" />
            <span className="mt-3 text-sm font-semibold text-[var(--text)]">
              {file ? file.name : "Drop image here or click to upload"}
            </span>
            <span className="mt-1 text-xs text-[var(--faint)]">PNG, JPG or WEBP</span>
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {message && <p className="mt-4 text-sm text-[var(--muted)]">{message}</p>}

        <Button className="mt-6 rounded-full border border-[var(--line)] bg-[var(--text)] px-7 text-[var(--bg)] hover:opacity-90" type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Image"}
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="admin-card group overflow-hidden rounded-[1.8rem] transition hover:-translate-y-1 hover:bg-[var(--panel-strong)]">
            <div className="relative aspect-square overflow-hidden bg-[var(--bg-soft)]">
              <Image
                src={image.image_url}
                alt={image.title || "Galerie image"}
                fill
                sizes="(min-width: 1024px) 33vw, 90vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70" />
            </div>

            <div className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{image.title || "Untitled"}</p>
                <p className="mt-1 text-xs text-[var(--faint)]">Portfolio image</p>
              </div>

              <button
                onClick={() => handleDelete(image)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-300/20 bg-red-300/10 text-red-300 transition hover:bg-red-300/20"
                aria-label="Delete image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
