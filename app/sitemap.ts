import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://whiteheart.org";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/programs", "/gallery", "/contact"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path ? 0.8 : 1,
  }));
}
