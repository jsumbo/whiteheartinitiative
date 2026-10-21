import type { MetadataRoute } from "next";
import { siteUrl as base } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/programs", "/gallery", "/contact"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path ? 0.8 : 1,
  }));
}
