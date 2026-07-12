import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["web-push"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "*.cdninstagram.com", pathname: "/**" },
      { protocol: "https", hostname: "*.fbcdn.net", pathname: "/**" },
      { protocol: "https", hostname: "scontent.cdninstagram.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
