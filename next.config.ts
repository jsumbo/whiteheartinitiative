import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Smaller files for visitors on mobile data.
    formats: ["image/avif", "image/webp"],
    // 55 is used for photos behind the dark green overlay, where lower quality is not visible.
    qualities: [55, 75],
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Old page addresses from before the Projects, Support Us and Media pages.
  async redirects() {
    return [
      { source: "/programs", destination: "/projects", permanent: true },
      { source: "/gallery", destination: "/media#photos", permanent: true },
      { source: "/contact", destination: "/about#contact", permanent: true },
    ];
  },
};

export default nextConfig;
