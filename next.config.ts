import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [375, 640, 768, 1024, 1280, 1920],
    imageSizes: [64, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
  },
  headers: async () => [
    {
      source: "/images/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/api/site-config",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
      ],
    },
  ],
};

export default nextConfig;
