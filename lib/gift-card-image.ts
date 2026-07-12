// Generează un PNG premium pentru cardul cadou, direct în browser (Canvas).
// Fără servicii externe, fără AI.

export type GiftCardData = {
  recipient_name?: string | null;
  amount?: number | null;
  message?: string | null;
  code: string;
  expires_at?: string | null;
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value + "T12:00:00").toLocaleDateString("ro-RO", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return value;
  }
}

export async function renderGiftCardPng(data: GiftCardData, logoSrc = "/neilzz-logo-light.png"): Promise<string> {
  const W = 1200;
  const H = 750;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Fundal negru premium + glow argintiu discret
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b0b0e");
  bg.addColorStop(1, "#191920");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.5, H * 0.16, 0, W * 0.5, H * 0.16, W * 0.62);
  glow.addColorStop(0, "rgba(205,208,218,0.12)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Rame argintii
  ctx.strokeStyle = "rgba(222,224,232,0.55)";
  ctx.lineWidth = 2;
  roundRect(ctx, 30, 30, W - 60, H - 60, 30);
  ctx.stroke();
  ctx.strokeStyle = "rgba(222,224,232,0.18)";
  ctx.lineWidth = 1;
  roundRect(ctx, 44, 44, W - 88, H - 88, 24);
  ctx.stroke();

  ctx.textAlign = "center";

  // Logo
  const logo = await loadImage(logoSrc);
  if (logo && logo.width > 0) {
    const lw = 260;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, (W - lw) / 2, 78, lw, lh);
  } else {
    ctx.fillStyle = "#e6e7ec";
    ctx.font = "600 64px Georgia, 'Times New Roman', serif";
    ctx.fillText("NEILZZ", W / 2, 150);
  }

  // Label
  ctx.fillStyle = "rgba(226,228,236,0.7)";
  ctx.font = "600 20px Arial, sans-serif";
  ctx.fillText("C A R D   C A D O U", W / 2, 250);

  // Destinatar
  if (data.recipient_name) {
    ctx.fillStyle = "rgba(210,213,222,0.72)";
    ctx.font = "400 22px Georgia, serif";
    ctx.fillText("Pentru", W / 2, 312);
    ctx.fillStyle = "#f3f4f7";
    ctx.font = "600 46px Georgia, 'Times New Roman', serif";
    ctx.fillText(data.recipient_name, W / 2, 366);
  }

  // Sumă
  const amount = Number(data.amount || 0);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 92px Georgia, 'Times New Roman', serif";
  ctx.fillText(`${amount} lei`, W / 2, 470);

  // Mesaj
  if (data.message) {
    ctx.fillStyle = "rgba(214,217,226,0.82)";
    ctx.font = "italic 400 26px Georgia, serif";
    const lines = wrapText(ctx, data.message, W - 260, 2);
    lines.forEach((line, i) => ctx.fillText(line, W / 2, 528 + i * 36));
  }

  // Linie separatoare
  const sepY = data.message ? 620 : 560;
  const sg = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
  sg.addColorStop(0, "rgba(222,224,232,0)");
  sg.addColorStop(0.5, "rgba(222,224,232,0.5)");
  sg.addColorStop(1, "rgba(222,224,232,0)");
  ctx.fillStyle = sg;
  ctx.fillRect(W * 0.2, sepY, W * 0.6, 1);

  // Cod + expirare
  ctx.fillStyle = "rgba(210,213,222,0.62)";
  ctx.font = "600 18px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`COD: ${data.code}`, 90, H - 78);
  ctx.textAlign = "right";
  ctx.fillText(`Valabil până la: ${formatDate(data.expires_at)}`, W - 90, H - 78);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(200,203,214,0.5)";
  ctx.font = "400 18px Georgia, serif";
  ctx.fillText("@neilzz_by.anto", W / 2, H - 78);

  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
