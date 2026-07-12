"use client";

import { useEffect, useRef, useState } from "react";

// Elements that get a gentle fade-up as they scroll into view.
const REVEAL_SELECTOR =
  "main section, .lux-panel, .admin-card, .premium-hero-card, .home-instagram-shell, .home-stat-card";

// Each theme gets its own distinct ambient effect (ported from maison-lux).
const FX_BY_ACCENT: Record<string, string> = {
  "rose-gold": "bokeh",
  champagne: "bubbles",
  emerald: "aurora",
  sapphire: "stars",
  bordeaux: "petals",
  amethyst: "nebula",
  "rose-paris": "bokeh",
  amber: "embers",
  turquoise: "waves",
  onyx: "rays",
};

export function SiteMotionRuntime() {
  const [hidden, setHidden] = useState(false);
  const mountedAt = useRef<number>(Date.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Elegant loading overlay: show briefly, then fade out.
  useEffect(() => {
    const MIN_MS = 650;
    const MAX_MS = 1600;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const elapsed = Date.now() - mountedAt.current;
      window.setTimeout(() => setHidden(true), Math.max(0, MIN_MS - elapsed));
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const fallback = window.setTimeout(finish, MAX_MS);
    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(fallback);
    };
  }, []);

  // Scroll reveal — progressive enhancement.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let observer: IntersectionObserver | null = null;
    const raf = window.requestAnimationFrame(() =>
      window.setTimeout(() => {
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
        ).filter((el) => !el.dataset.reveal);
        if (!nodes.length) return;
        observer = new IntersectionObserver(
          (entries, obs) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                entry.target.classList.add("reveal-in");
                obs.unobserve(entry.target);
              }
            }
          },
          { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        );
        nodes.forEach((el, i) => {
          el.dataset.reveal = "true";
          el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
          observer!.observe(el);
        });
      }, 60)
    );
    return () => {
      window.cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, []);

  // Animated ambient background — a distinct effect per theme (no cursor).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const TAU = Math.PI * 2;
    const R = (a: number, b: number) => a + Math.random() * (b - a);
    // Count scaling for performance (fewer particles on smaller screens).
    const cnt = (n: number) => {
      const s = W < 720 ? 0.5 : W < 1200 ? 0.78 : 1;
      return Math.max(4, Math.round(n * s));
    };

    let W = 0;
    let H = 0;
    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    let t = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let particles: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let extras: any[] = [];
    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;

    const currentAccent = () =>
      document.documentElement.dataset.accent || "rose-gold";
    let currentFx = FX_BY_ACCENT[currentAccent()] || "bokeh";

    const glint = (x: number, y: number, size: number, alpha: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color.replace("ALPHA", alpha.toFixed(2));
      ctx.lineWidth = 1;
      ctx.shadowColor = color.replace("ALPHA", ".8");
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-size, 0); ctx.lineTo(size, 0);
      ctx.moveTo(0, -size); ctx.lineTo(0, size);
      ctx.stroke();
      ctx.restore();
      ctx.shadowBlur = 0;
    };

    /* 1. CHAMPAGNE — rising bubbles + diamond glints */
    const initBubbles = () => {
      particles = Array.from({ length: cnt(64) }, () => {
        const depth = Math.random();
        return { x: R(0, W), y: R(0, H), r: 0.8 + depth * 4, sp: 0.2 + depth * 1.2, depth, wob: R(0, TAU), wobSp: R(0.008, 0.028), a: 0.12 + depth * 0.6, spark: Math.random() < 0.2 };
      });
      extras = Array.from({ length: cnt(8) }, () => ({ x: R(0, W), y: R(0, H), ph: R(0, TAU), sp: R(0.015, 0.04), size: R(4, 9) }));
    };
    const drawBubbles = () => {
      for (const p of particles) {
        p.y -= p.sp; p.wob += p.wobSp;
        const x = p.x + Math.sin(p.wob) * (10 + p.depth * 10);
        const y = p.y;
        if (p.y < -12) { p.y = H + 12; p.x = R(0, W); }
        const tw = p.spark ? 0.5 + 0.5 * Math.sin(t * 0.08 + p.wob * 5) : 1;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, TAU);
        ctx.fillStyle = `rgba(232,198,132,${(p.a * tw).toFixed(3)})`;
        ctx.shadowColor = "rgba(232,198,132,.85)";
        ctx.shadowBlur = p.spark ? 16 : 5 + p.depth * 5;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (p.depth > 0.7) {
          ctx.beginPath();
          ctx.arc(x - p.r * 0.3, y - p.r * 0.3, p.r * 0.25, 0, TAU);
          ctx.fillStyle = `rgba(255,245,220,${(p.a * 0.9).toFixed(3)})`;
          ctx.fill();
        }
      }
      for (const g of extras) {
        g.ph += g.sp;
        const a = Math.max(0, Math.sin(g.ph));
        if (a > 0.05) glint(g.x, g.y, g.size * a, a * 0.8, "rgba(255,235,190,ALPHA)");
        if (g.ph > TAU) { g.ph = 0; g.x = R(0, W); g.y = R(0, H); }
      }
    };

    /* 2. AURORA — waves + stars + light pillars */
    const initAurora = () => {
      particles = Array.from({ length: 4 }, (_, i) => ({ yBase: H * (0.18 + i * 0.17), amp: R(40, 100), ph: R(0, 6), sp: R(0.003, 0.007), hue: [150, 163, 175, 142][i], alpha: 0.11 - i * 0.015 }));
      extras = Array.from({ length: cnt(48) }, () => ({ x: R(0, W), y: R(0, H), r: R(0.3, 1.1), tw: R(0, 6), twSp: R(0.008, 0.03) }));
    };
    const drawAurora = () => {
      for (const s of extras) {
        s.tw += s.twSp;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fillStyle = `rgba(190,240,220,${(0.15 + 0.3 * Math.abs(Math.sin(s.tw))).toFixed(3)})`;
        ctx.fill();
      }
      ctx.globalCompositeOperation = "lighter";
      for (const b of particles) {
        b.ph += b.sp;
        const grad = ctx.createLinearGradient(0, b.yBase - 130, 0, b.yBase + 130);
        grad.addColorStop(0, "rgba(62,214,163,0)");
        grad.addColorStop(0.5, `hsla(${b.hue}, 72%, 55%, ${b.alpha + 0.06})`);
        grad.addColorStop(1, "rgba(62,214,163,0)");
        ctx.beginPath();
        for (let x = 0; x <= W; x += 12) {
          const y = b.yBase + Math.sin(x * 0.0045 + b.ph) * b.amp + Math.sin(x * 0.0012 + b.ph * 1.7) * b.amp * 0.6;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineWidth = 95;
        ctx.strokeStyle = grad;
        ctx.filter = "blur(16px)";
        ctx.stroke();
        ctx.filter = "none";
      }
      for (let i = 0; i < 3; i++) {
        const px = (W / 3) * i + W / 6 + Math.sin(t * 0.004 + i * 2) * 80;
        const a = 0.025 + 0.02 * Math.sin(t * 0.01 + i * 2.4);
        const g = ctx.createLinearGradient(px, 0, px, H * 0.7);
        g.addColorStop(0, `rgba(120,240,190,${Math.max(0, a).toFixed(3)})`);
        g.addColorStop(1, "rgba(120,240,190,0)");
        ctx.fillStyle = g;
        ctx.fillRect(px - 30, 0, 60, H * 0.7);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    /* 3. STARS — twinkle + shooting stars */
    const initStars = () => {
      particles = Array.from({ length: cnt(120) }, () => {
        const depth = Math.random();
        return { bx: R(0, W), by: R(0, H), r: 0.3 + depth * 1.5, depth, tw: R(0, 6), twSp: R(0.01, 0.05) };
      });
      shooting = null;
    };
    const drawStars = () => {
      for (const s of particles) {
        s.tw += s.twSp;
        const a = 0.25 + 0.75 * Math.abs(Math.sin(s.tw));
        ctx.beginPath();
        ctx.arc(s.bx, s.by, s.r, 0, TAU);
        ctx.fillStyle = `rgba(200,215,255,${a.toFixed(3)})`;
        ctx.shadowColor = "rgba(160,190,255,.8)";
        ctx.shadowBlur = s.depth > 0.8 ? 6 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (!shooting && Math.random() < 0.01) {
        shooting = { x: R(W * 0.05, W * 0.9), y: R(0, H * 0.35), vx: R(7, 12), vy: R(2.5, 5), life: 1 };
      }
      if (shooting) {
        const s = shooting;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 16, s.y - s.vy * 16);
        grad.addColorStop(0, `rgba(200,218,255,${s.life.toFixed(2)})`);
        grad.addColorStop(1, "rgba(200,218,255,0)");
        ctx.strokeStyle = grad; ctx.lineWidth = 2.2;
        ctx.shadowColor = "rgba(180,205,255,.9)"; ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 16, s.y - s.vy * 16);
        ctx.stroke();
        ctx.shadowBlur = 0;
        s.x += s.vx; s.y += s.vy; s.life -= 0.018;
        if (s.life <= 0 || s.x > W + 250) shooting = null;
      }
    };

    /* 4. PETALS — falling petals + rose dust */
    const initPetals = () => {
      particles = Array.from({ length: cnt(38) }, () => {
        const depth = Math.random();
        return { x: R(0, W), y: R(-H, 0), w: 5 + depth * 11, sp: 0.4 + depth * 1.1, sway: R(0, 6), swaySp: R(0.01, 0.03), rot: R(0, 6), rotSp: R(-0.03, 0.03), a: 0.25 + depth * 0.55, depth };
      });
      extras = Array.from({ length: cnt(24) }, () => ({ x: R(0, W), y: R(0, H), r: R(0.4, 1.2), sp: R(0.1, 0.4), a: R(0.1, 0.35) }));
    };
    const drawPetals = () => {
      for (const p of particles) {
        p.y += p.sp; p.sway += p.swaySp; p.rot += p.rotSp;
        const x = p.x + Math.sin(p.sway) * 30;
        if (p.y > H + 20) { p.y = -20; p.x = R(0, W); }
        ctx.save();
        ctx.translate(x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w, p.w * 0.55, 0, 0, TAU);
        const grad = ctx.createLinearGradient(-p.w, 0, p.w, 0);
        grad.addColorStop(0, `rgba(190,60,95,${p.a.toFixed(2)})`);
        grad.addColorStop(1, `rgba(235,120,145,${p.a.toFixed(2)})`);
        ctx.fillStyle = grad;
        ctx.shadowColor = "rgba(224,106,132,.5)";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
      }
      for (const d of extras) {
        d.y -= d.sp;
        if (d.y < 0) { d.y = H; d.x = R(0, W); }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, TAU);
        ctx.fillStyle = `rgba(240,150,170,${d.a.toFixed(2)})`;
        ctx.fill();
      }
    };

    /* 5. NEBULA — clouds + star dust */
    const initNebula = () => {
      particles = Array.from({ length: 7 }, () => ({ x: R(0, W), y: R(0, H), r: R(100, 240), vx: R(-0.2, 0.2), vy: R(-0.15, 0.15), ph: R(0, 6), phSp: R(0.005, 0.015), hue: R(258, 292) }));
      extras = Array.from({ length: cnt(70) }, () => ({ x: R(0, W), y: R(0, H), r: R(0.3, 1.3), tw: R(0, 6), twSp: R(0.01, 0.06) }));
    };
    const drawNebula = () => {
      ctx.globalCompositeOperation = "lighter";
      for (const n of particles) {
        n.x += n.vx; n.y += n.vy; n.ph += n.phSp;
        if (n.x < -n.r) n.x = W + n.r; if (n.x > W + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = H + n.r; if (n.y > H + n.r) n.y = -n.r;
        const pulse = 0.6 + 0.4 * Math.sin(n.ph);
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * pulse);
        g.addColorStop(0, `hsla(${n.hue}, 78%, 62%, .14)`);
        g.addColorStop(1, "hsla(270, 78%, 62%, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      for (const s of extras) {
        s.tw += s.twSp;
        const a = 0.2 + 0.6 * Math.abs(Math.sin(s.tw));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fillStyle = `rgba(215,190,255,${a.toFixed(3)})`;
        ctx.fill();
      }
    };

    /* 6. INK — calligraphy strokes + gold-leaf flakes */
    const newInkStroke = (anywhere: boolean) => ({
      x: anywhere ? R(0, W) : R(-100, W * 0.3), y: R(0, H), len: R(140, 380), prog: anywhere ? R(0, 1) : 0, sp: R(0.0015, 0.004), amp: R(10, 45), ph: R(0, 6), a: R(0.05, 0.15), lw: R(0.6, 2.2),
    });
    const initInk = () => {
      particles = Array.from({ length: cnt(12) }, () => newInkStroke(true));
      extras = Array.from({ length: cnt(18) }, () => ({ x: R(0, W), y: R(0, H), r: R(0.8, 2.4), vx: R(-0.1, 0.1), vy: R(0.05, 0.25), ph: R(0, 6), phSp: R(0.01, 0.04) }));
    };
    const drawInk = () => {
      for (let i = 0; i < particles.length; i++) {
        const s = particles[i];
        s.prog += s.sp;
        if (s.prog > 1.4) { particles[i] = newInkStroke(false); continue; }
        const fade = s.prog < 0.2 ? s.prog / 0.2 : s.prog > 1 ? 1 - (s.prog - 1) / 0.4 : 1;
        ctx.beginPath();
        const steps = 44;
        for (let j = 0; j <= steps * Math.min(s.prog, 1); j++) {
          const px = s.x + (j / steps) * s.len;
          const py = s.y + Math.sin(j * 0.3 + s.ph) * s.amp * Math.sin((j / steps) * Math.PI);
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(50,38,24,${(s.a * fade).toFixed(3)})`;
        ctx.lineWidth = s.lw;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      for (const f of extras) {
        f.x += f.vx; f.y += f.vy; f.ph += f.phSp;
        if (f.y > H) { f.y = -5; f.x = R(0, W); }
        const sheen = 0.35 + 0.55 * Math.abs(Math.sin(f.ph));
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.ph);
        ctx.fillStyle = `rgba(178,140,72,${sheen.toFixed(2)})`;
        ctx.shadowColor = "rgba(200,160,80,.6)";
        ctx.shadowBlur = 4;
        ctx.fillRect(-f.r, -f.r * 0.6, f.r * 2, f.r * 1.2);
        ctx.restore();
        ctx.shadowBlur = 0;
      }
    };

    /* 7. BOKEH — soft depth-of-field orbs, rose↔gold drift */
    const initBokeh = () => {
      particles = Array.from({ length: cnt(26) }, () => {
        const depth = Math.random();
        return { x: R(0, W), y: R(0, H), r: 10 + depth * 65, depth, vx: R(-0.25, 0.25) * (1.2 - depth), vy: R(-0.2, 0.2) * (1.2 - depth), ph: R(0, 6), phSp: R(0.004, 0.012), a: 0.03 + (1 - depth) * 0.12, hueOff: R(-14, 14) };
      });
    };
    const drawBokeh = () => {
      ctx.globalCompositeOperation = "lighter";
      const baseHue = 8 + 18 * Math.sin(t * 0.002);
      for (const b of particles) {
        b.x += b.vx; b.y += b.vy; b.ph += b.phSp;
        const x = b.x, y = b.y;
        if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = H + b.r; if (b.y > H + b.r) b.y = -b.r;
        const a = b.a * (0.6 + 0.4 * Math.sin(b.ph));
        const hue = baseHue + b.hueOff;
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, `hsla(${hue}, 62%, 74%, ${a.toFixed(3)})`);
        g.addColorStop(0.72, `hsla(${hue}, 62%, 74%, ${(a * 0.55).toFixed(3)})`);
        g.addColorStop(1, `hsla(${hue}, 62%, 74%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, TAU);
        ctx.fill();
        if (b.depth < 0.3) {
          ctx.beginPath();
          ctx.arc(x, y, b.r * 0.96, 0, TAU);
          ctx.strokeStyle = `hsla(${hue}, 70%, 80%, ${(a * 0.8).toFixed(3)})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    /* 8. EMBERS — hearth glow + smoke + rising embers */
    const initEmbers = () => {
      particles = Array.from({ length: cnt(44) }, () => ({ x: R(0, W), y: R(0, H), r: R(1, 3.2), sp: R(0.4, 1.8), drift: R(-0.3, 0.3), fl: R(0, 6), flSp: R(0.05, 0.17) }));
      extras = Array.from({ length: 6 }, () => ({ x: R(0, W), y: H + R(0, 100), r: R(50, 120), sp: R(0.2, 0.5), a: R(0.02, 0.05), ph: R(0, 6) }));
    };
    const drawEmbers = () => {
      const hearth = ctx.createLinearGradient(0, H, 0, H - 260);
      const flick = 0.05 + 0.02 * Math.sin(t * 0.05) + 0.012 * Math.sin(t * 0.13);
      hearth.addColorStop(0, `rgba(255,110,30,${flick.toFixed(3)})`);
      hearth.addColorStop(1, "rgba(255,110,30,0)");
      ctx.fillStyle = hearth;
      ctx.fillRect(0, H - 260, W, 260);
      for (const s of extras) {
        s.y -= s.sp; s.ph += 0.01;
        if (s.y < -s.r) { s.y = H + s.r; s.x = R(0, W); }
        const g = ctx.createRadialGradient(s.x + Math.sin(s.ph) * 26, s.y, 0, s.x, s.y, s.r);
        g.addColorStop(0, `rgba(120,80,50,${s.a.toFixed(3)})`);
        g.addColorStop(1, "rgba(120,80,50,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fill();
      }
      for (const e of particles) {
        e.y -= e.sp; e.fl += e.flSp;
        e.x += e.drift + Math.sin(e.fl) * 0.4;
        const y = e.y;
        if (e.y < -10) { e.y = H + 10; e.x = R(0, W); }
        const a = 0.3 + 0.7 * Math.abs(Math.sin(e.fl));
        const heat = Math.floor(120 + 90 * Math.abs(Math.sin(e.fl)));
        ctx.beginPath();
        ctx.arc(e.x, y, e.r, 0, TAU);
        ctx.fillStyle = `rgba(255,${heat},50,${a.toFixed(3)})`;
        ctx.shadowColor = "rgba(255,150,50,.9)";
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    /* 9. WAVES — moon + reflection + wave lines + foam */
    const initWaves = () => {
      particles = Array.from({ length: 6 }, (_, i) => ({ yBase: H * (0.5 + i * 0.09), amp: R(14, 36), ph: R(0, 6), sp: R(0.008, 0.022) * (i % 2 ? -1 : 1), a: 0.11 - i * 0.012, lw: R(1.2, 2.6) }));
      extras = [];
    };
    const drawWaves = () => {
      const moonX = W * 0.78, moonY = H * 0.18;
      const mg = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 90);
      mg.addColorStop(0, "rgba(220,250,252,.5)");
      mg.addColorStop(0.25, "rgba(190,240,245,.14)");
      mg.addColorStop(1, "rgba(190,240,245,0)");
      ctx.fillStyle = mg;
      ctx.beginPath(); ctx.arc(moonX, moonY, 90, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(moonX, moonY, 26, 0, TAU);
      ctx.fillStyle = "rgba(228,250,252,.85)";
      ctx.shadowColor = "rgba(200,245,250,.9)"; ctx.shadowBlur = 30;
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "lighter";
      for (let y = H * 0.5; y < H; y += 7) {
        const wob = Math.sin(y * 0.05 + t * 0.04) * (6 + (y - H * 0.5) * 0.06);
        const wdt = 3 + (y - H * 0.5) * 0.05 + Math.abs(Math.sin(y * 0.13 + t * 0.06)) * 8;
        const a = 0.07 * (1 - (y - H * 0.5) / (H * 0.5)) + 0.02;
        ctx.fillStyle = `rgba(160,240,246,${a.toFixed(3)})`;
        ctx.fillRect(moonX + wob - wdt / 2, y, wdt, 4);
      }
      ctx.globalCompositeOperation = "source-over";
      for (const w of particles) {
        w.ph += w.sp;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 8) {
          const y = w.yBase + Math.sin(x * 0.008 + w.ph) * w.amp + Math.sin(x * 0.003 - w.ph * 1.4) * w.amp * 0.7;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(79,219,228,${(w.a + 0.06).toFixed(3)})`;
        ctx.lineWidth = w.lw;
        ctx.shadowColor = "rgba(79,219,228,.6)";
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      if (t % 3 === 0) {
        extras.push({ x: R(0, W), y: R(H * 0.5, H), life: 1 });
        if (extras.length > 40) extras.shift();
      }
      for (const f of extras) {
        f.life -= 0.02;
        if (f.life <= 0) continue;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 1.1 * f.life, 0, TAU);
        ctx.fillStyle = `rgba(190,248,252,${(f.life * 0.6).toFixed(2)})`;
        ctx.fill();
      }
    };

    /* 10. RAYS — platinum beams + diamond dust */
    const initRays = () => {
      particles = Array.from({ length: 6 }, () => ({ off: R(-W, W), w: R(70, 200), sp: R(0.15, 0.5), a: R(0.02, 0.055) }));
      extras = Array.from({ length: cnt(46) }, () => {
        const depth = Math.random();
        return { x: R(0, W), y: R(0, H), r: 0.3 + depth, depth, sp: 0.05 + depth * 0.3, tw: R(0, 6), twSp: R(0.02, 0.07) };
      });
    };
    const drawRays = () => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const r of particles) {
        r.off += r.sp;
        if (r.off > W + 400) r.off = -W - 400;
        ctx.save();
        ctx.translate(r.off, 0);
        ctx.transform(1, 0, -0.45, 1, 0, 0);
        const g = ctx.createLinearGradient(0, 0, r.w, 0);
        g.addColorStop(0, "rgba(214,217,224,0)");
        g.addColorStop(0.5, `rgba(214,217,224,${r.a.toFixed(3)})`);
        g.addColorStop(1, "rgba(214,217,224,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, -H, r.w, H * 3);
        ctx.restore();
      }
      ctx.restore();
      for (const d of extras) {
        d.y += d.sp * 0.4; d.x += d.sp * 0.2; d.tw += d.twSp;
        if (d.y > H) { d.y = -5; d.x = R(0, W); }
        if (d.x > W) d.x = 0;
        const a = 0.15 + 0.55 * Math.abs(Math.sin(d.tw));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, TAU);
        ctx.fillStyle = `rgba(226,230,238,${a.toFixed(3)})`;
        ctx.fill();
        if (d.depth > 0.92 && Math.sin(d.tw) > 0.96) glint(d.x, d.y, 6, 0.7, "rgba(240,242,248,ALPHA)");
      }
    };

    const inits: Record<string, () => void> = { bubbles: initBubbles, aurora: initAurora, stars: initStars, petals: initPetals, nebula: initNebula, ink: initInk, bokeh: initBokeh, embers: initEmbers, waves: initWaves, rays: initRays };
    const draws: Record<string, () => void> = { bubbles: drawBubbles, aurora: drawAurora, stars: drawStars, petals: drawPetals, nebula: drawNebula, ink: drawInk, bokeh: drawBokeh, embers: drawEmbers, waves: drawWaves, rays: drawRays };

    const initFx = (fx: string) => {
      currentFx = inits[fx] ? fx : "bokeh";
      extras = [];
      inits[currentFx]();
    };

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      initFx(currentFx);
    };

    let raf = 0;
    const loop = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      (draws[currentFx] || draws.bokeh)();
      raf = window.requestAnimationFrame(loop);
    };
    const stop = () => { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } };
    const start = () => { if (!raf && !document.hidden) loop(); };

    const onResize = () => resize();
    const onVisibility = () => (document.hidden ? stop() : start());
    const onAccent = () => {
      const fx = FX_BY_ACCENT[currentAccent()] || "bokeh";
      if (fx !== currentFx) initFx(fx);
    };

    resize();
    if (reduce) {
      ctx.clearRect(0, 0, W, H);
      (draws[currentFx] || draws.bokeh)();
    } else {
      start();
    }

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("neilzz-accent-changed", onAccent);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("neilzz-accent-changed", onAccent);
    };
  }, []);

  return (
    <>
      <canvas id="lux-living-bg" ref={canvasRef} aria-hidden="true" />
      <div className="lux-loader" data-hidden={hidden ? "true" : "false"} aria-hidden={hidden}>
        <div className="lux-loader-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lux-loader-logo" src="/neilzz-logo-light.png" alt="neilzzbyanto" />
          <div className="lux-loader-ring" />
          <span className="lux-loader-label">neilzz by anto</span>
        </div>
      </div>
    </>
  );
}
