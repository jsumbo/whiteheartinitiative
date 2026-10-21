import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/content";
import { siteUrl as base } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/about", "/projects", "/news", "/media", "/support"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly" as const,
    priority: path ? 0.8 : 1,
  }));
  const posts = (await getPosts()).map((p) => ({
    url: `${base}/news/${p.slug}`,
    lastModified: p.date || undefined,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  return [...pages, ...posts];
}
