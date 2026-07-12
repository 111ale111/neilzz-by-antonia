"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Copy, Eye, Plus, Save, Star, Trash2, UploadCloud, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SettingValue = {
  featuredClient?: boolean;
  featuredDesign?: boolean;
  featuredReview?: boolean;
  publicBookingEnabled?: boolean;
  appStatus?: string;
};

type BrandAssets = {
  logoUrl?: string;
  logoPath?: string;
};

type HomepageContent = {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  instagramHandle: string;
  instagramUrl: string;
};

const defaultSettings: SettingValue = {
  featuredClient: false,
  featuredDesign: true,
  featuredReview: true,
  publicBookingEnabled: true,
  appStatus: "active",
};

const defaultHomepageContent: HomepageContent = {
  badge: "Private nail atelier",
  titleLine1: "Quiet luxury.",
  titleLine2: "Perfect finish.",
  subtitle: "Forme curate, detalii fine și un finish premium — gândit ca o experiență privată, nu ca un template.",
  primaryCta: "Vezi galeria",
  secondaryCta: "Programează-te",
  instagramHandle: "@neilzz_by.anto",
  instagramUrl: "https://instagram.com/neilzz_by.anto",
};


export function SettingsManager() {
  const supabase = createClient();
  const [settings, setSettings] = useState<SettingValue>(defaultSettings);
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(defaultHomepageContent);
  const [brandAssets, setBrandAssets] = useState<BrandAssets>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<any[]>([]);
  const [manualCode, setManualCode] = useState("");

  async function loadSettings() {
    const [{ data }, { data: contentData }, { data: brandData }, { data: codeData }] = await Promise.all([
      supabase.from("site_settings").select("value").eq("key", "homepage_features").maybeSingle(),
      supabase.from("site_settings").select("value").eq("key", "homepage_content").maybeSingle(),
      supabase.from("site_settings").select("value").eq("key", "brand_assets").maybeSingle(),
      supabase.from("activation_codes").select("*").order("created_at", { ascending: false }).limit(40),
    ]);
    if (data?.value && typeof data.value === "object") {
      setSettings({ ...defaultSettings, ...(data.value as SettingValue) });
    }
    if (contentData?.value && typeof contentData.value === "object") {
      setHomepageContent({ ...defaultHomepageContent, ...(contentData.value as HomepageContent) });
    }
    if (brandData?.value && typeof brandData.value === "object") {
      setBrandAssets(brandData.value as BrandAssets);
    }
    if (codeData) setCodes(codeData);
  }

  function makeCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(6);
    window.crypto.getRandomValues(bytes);
    const part = Array.from(bytes).map((byte) => alphabet[byte % alphabet.length]).join("");
    return `NB-${part.slice(0, 3)}-${part.slice(3)}`;
  }

  async function createCode(codeValue?: string) {
    const code = (codeValue || makeCode()).trim().toUpperCase();
    if (!code) return;
    const { error } = await supabase.from("activation_codes").insert({ code, is_used: false });
    setMessage(error ? error.message : `Cod creat: ${code}`);
    setManualCode("");
    await loadSettings();
  }

  async function deleteCode(id: string) {
    if (!window.confirm("Ștergi acest cod de activare?")) return;
    await supabase.from("activation_codes").delete().eq("id", id);
    await loadSettings();
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setMessage(`Copiat: ${code}`);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveSettings(next = settings) {
    setLoading(true);
    setMessage("");
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "homepage_features", value: next, updated_at: new Date().toISOString() }, { onConflict: "key" });
    setLoading(false);
    setMessage(error ? error.message : "Setările au fost salvate.");
  }



  async function saveLogo() {
    if (!logoFile) {
      setMessage("Alege un logo PNG/JPG înainte de upload.");
      return;
    }
    setLoading(true);
    setMessage("");
    const ext = logoFile.name.split(".").pop() || "png";
    const path = `logos/neilzz-logo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("site-assets").upload(path, logoFile, { upsert: true });
    let logoUrl = "";
    if (uploadError) {
      const reader = new FileReader();
      logoUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Logo-ul nu a putut fi citit."));
        reader.readAsDataURL(logoFile);
      });
    } else {
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      logoUrl = data.publicUrl;
    }
    const nextAssets = { logoUrl, logoPath: uploadError ? undefined : path };
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "brand_assets", value: nextAssets, updated_at: new Date().toISOString() }, { onConflict: "key" });
    setBrandAssets(nextAssets);
    setLogoFile(null);
    setLoading(false);
    setMessage(error ? error.message : uploadError ? "Logo salvat în settings ca fallback local. Pentru URL permanent creează bucket public site-assets." : "Logo-ul a fost salvat.");
  }

  async function saveHomepageContent() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "homepage_content", value: homepageContent, updated_at: new Date().toISOString() }, { onConflict: "key" });
    setLoading(false);
    setMessage(error ? error.message : "Textele homepage au fost salvate.");
  }


  function updateHomepageField(key: keyof HomepageContent, value: string) {
    setHomepageContent((current) => ({ ...current, [key]: value }));
  }

  function toggle(key: keyof SettingValue) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    saveSettings(next);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <button onClick={() => toggle("featuredClient")} className="lux-panel rounded-[2rem] p-6 text-left transition hover:-translate-y-1">
          <UserRound className="h-9 w-9 text-[var(--rose-strong)]" />
          <h2 className="mt-6 font-serif text-4xl">Clientă evidențiată</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Afișează sau ascunde clienta evidențiată pe homepage.</p>
          <span className={settings.featuredClient ? "status-pill status-available" : "status-pill status-full"}>{settings.featuredClient ? "ON" : "OFF"}</span>
        </button>
        <button onClick={() => toggle("featuredDesign")} className="lux-panel rounded-[2rem] p-6 text-left transition hover:-translate-y-1">
          <Eye className="h-9 w-9 text-[var(--rose-strong)]" />
          <h2 className="mt-6 font-serif text-4xl">Design evidențiat</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Controlează designul principal evidențiat în secțiunile publice.</p>
          <span className={settings.featuredDesign ? "status-pill status-available" : "status-pill status-full"}>{settings.featuredDesign ? "ON" : "OFF"}</span>
        </button>
        <button onClick={() => toggle("featuredReview")} className="lux-panel rounded-[2rem] p-6 text-left transition hover:-translate-y-1">
          <Star className="h-9 w-9 text-[var(--rose-strong)]" />
          <h2 className="mt-6 font-serif text-4xl">Review evidențiat</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Controlează review-ul promovat pe homepage.</p>
          <span className={settings.featuredReview ? "status-pill status-available" : "status-pill status-full"}>{settings.featuredReview ? "ON" : "OFF"}</span>
        </button>
        <button onClick={() => toggle("publicBookingEnabled")} className="lux-panel rounded-[2rem] p-6 text-left transition hover:-translate-y-1">
          <CalendarDays className="h-9 w-9 text-[var(--rose-strong)]" />
          <h2 className="mt-6 font-serif text-4xl">Booking public</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Afișează sau ascunde cardul public cu următoarea fereastră de booking.</p>
          <span className={settings.publicBookingEnabled ? "status-pill status-available" : "status-pill status-full"}>{settings.publicBookingEnabled ? "ON" : "OFF"}</span>
        </button>
      </section>

      <section className="lux-panel rounded-[2rem] p-6 md:p-7">
        <p className="lux-label">Status aplicație</p>
        <h2 className="mt-3 font-serif text-4xl">Status public</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <select className="lux-input" value={settings.appStatus || "active"} onChange={(e) => setSettings((value) => ({ ...value, appStatus: e.target.value }))}>
            <option value="active">Activ</option>
            <option value="limited">Booking limitat</option>
            <option value="vacation">Concediu</option>
            <option value="closed">Închis temporar</option>
          </select>
          <button onClick={() => saveSettings()} disabled={loading} className="lux-action lux-action-soft inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50">
            <Save className="h-4 w-4" /> {loading ? "Se salvează..." : "Salvează setările"}
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-[var(--muted)]">{message}</p>}
      </section>



      <section className="lux-panel rounded-[2rem] p-6 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="lux-label">Coduri activare</p>
            <h2 className="mt-3 font-serif text-4xl">Activare conturi</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">Codurile sunt folosite de cliente în Account pentru activarea contului și review-uri verificate. Nu mai apar în pagina Reviews.</p>
          </div>
          <button onClick={() => createCode()} className="lux-action lux-action-soft inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"><Plus className="h-4 w-4" /> Generează cod</button>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <input className="lux-input" placeholder="Cod manual, ex: NB-ABC-123" value={manualCode} onChange={(e) => setManualCode(e.target.value)} />
          <button onClick={() => createCode(manualCode)} className="rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--text)]">Adaugă manual</button>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {codes.map((item) => (
            <article key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-lg tracking-[.18em] text-[var(--text)]">{item.code}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{item.is_used ? "Folosit" : "Disponibil"}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyCode(item.code)} className="rounded-full border border-[var(--line)] p-2 text-[var(--muted)]"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => deleteCode(item.id)} className="rounded-full border border-red-300/20 p-2 text-red-300"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>



      <section className="lux-panel rounded-[2rem] p-6 md:p-7">
        <p className="lux-label">Branding</p>
        <h2 className="mt-3 font-serif text-4xl">Upload logo</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">Încarcă un logo nou din Settings. Se aplică în header după refresh. Recomandat: PNG transparent sau variantă albă pentru fundal dark.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
          <div className="grid min-h-36 place-items-center rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel)] p-5">
            <img src={brandAssets.logoUrl || "/neilzz-logo-light.png"} alt="Logo preview" className="max-h-24 w-auto object-contain drop-shadow-[0_0_22px_rgba(247,192,207,.24)]" />
          </div>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
              <UploadCloud className="h-5 w-5 text-[var(--rose-strong)]" />
              <span>{logoFile ? logoFile.name : "Alege logo PNG/JPG/WEBP"}</span>
              <input className="hidden" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            </label>
            <button onClick={saveLogo} disabled={loading} className="lux-action lux-action-soft inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50">
              <Save className="h-4 w-4" /> Salvează logo
            </button>
          </div>
        </div>
      </section>

      <section className="lux-panel rounded-[2rem] p-6 md:p-7">
        <p className="lux-label">Homepage editor</p>
        <h2 className="mt-3 font-serif text-4xl">Texte homepage</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">Schimbi textele principale fără cod. Se aplică pe homepage după refresh.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="lux-input" placeholder="Badge" value={homepageContent.badge} onChange={(e) => updateHomepageField("badge", e.target.value)} />
          <input className="lux-input" placeholder="Titlu linia 1" value={homepageContent.titleLine1} onChange={(e) => updateHomepageField("titleLine1", e.target.value)} />
          <input className="lux-input" placeholder="Titlu linia 2" value={homepageContent.titleLine2} onChange={(e) => updateHomepageField("titleLine2", e.target.value)} />
          <input className="lux-input" placeholder="CTA galerie" value={homepageContent.primaryCta} onChange={(e) => updateHomepageField("primaryCta", e.target.value)} />
          <input className="lux-input" placeholder="CTA programare" value={homepageContent.secondaryCta} onChange={(e) => updateHomepageField("secondaryCta", e.target.value)} />
          <input className="lux-input" placeholder="Instagram handle" value={homepageContent.instagramHandle} onChange={(e) => updateHomepageField("instagramHandle", e.target.value)} />
          <input className="lux-input md:col-span-2" placeholder="Instagram URL" value={homepageContent.instagramUrl} onChange={(e) => updateHomepageField("instagramUrl", e.target.value)} />
          <textarea className="lux-input min-h-28 md:col-span-2" placeholder="Subtitlu" value={homepageContent.subtitle} onChange={(e) => updateHomepageField("subtitle", e.target.value)} />
        </div>
        <button onClick={saveHomepageContent} disabled={loading} className="lux-action lux-action-soft mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50">
          <Save className="h-4 w-4" /> Salvează textele
        </button>
      </section>

    </div>
  );
}
