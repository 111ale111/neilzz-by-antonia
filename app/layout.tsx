import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ThemeEngineRuntime } from "@/components/theme-engine-runtime";
import { AnalyticsTracker } from "@/components/analytics-tracker";

export const metadata: Metadata = {
  title: "neilzzbyanto",
  description: "Manichiură premium, galerie luxury și programări private prin Instagram.",
  manifest: "/manifest.json?v=21",
  icons: {
    icon: [
      { url: "/icon-192.png?v=21", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=21", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=21", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "neilzzbyanto",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050304",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body><ServiceWorkerRegister /><ThemeEngineRuntime /><AnalyticsTracker />{children}</body>
    </html>
  );
}
