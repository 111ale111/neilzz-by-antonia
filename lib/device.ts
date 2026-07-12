// Detectează aproximativ dispozitivul + browserul din user-agent.
export function detectDevice(userAgent?: string | null): string {
  const ua = (userAgent || "").toLowerCase();
  if (!ua) return "Dispozitiv necunoscut";

  let os = "Dispozitiv";
  if (/iphone/.test(ua)) os = "iPhone";
  else if (/ipad/.test(ua)) os = "iPad";
  else if (/android/.test(ua)) os = "Android";
  else if (/macintosh|mac os x/.test(ua)) os = "Mac";
  else if (/windows/.test(ua)) os = "Windows";
  else if (/linux/.test(ua)) os = "Linux";

  let browser = "";
  // Ordinea contează (Edge/Chrome conțin "safari" etc.)
  if (/edg\//.test(ua)) browser = "Edge";
  else if (/firefox|fxios/.test(ua)) browser = "Firefox";
  else if (/crios|chrome/.test(ua)) browser = "Chrome";
  else if (/safari/.test(ua)) browser = "Safari";

  return browser ? `${os} · ${browser}` : os;
}

// Preview scurt al endpoint-ului (nu expune endpoint-ul complet).
export function endpointPreview(endpoint?: string | null): string {
  if (!endpoint) return "—";
  if (endpoint.length <= 24) return endpoint;
  return `${endpoint.slice(0, 16)}…${endpoint.slice(-8)}`;
}
