import type { Metadata } from "next";

// Absolute links in social previews need the real domain. NEXT_PUBLIC_SITE_URL overrides it, e.g. for previews.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://whiteheartinitiative.org").replace(/\/$/, "");

export const siteName = "White Heart Initiative";

// Social preview image, made from the logo by scripts/brand-images.mjs.
export const ogImage = { url: "/og-image.png", width: 1200, height: 630, alt: `${siteName} logo: leading the future` };

export const openGraph = { siteName, type: "website", locale: "en", images: [ogImage] } satisfies Metadata["openGraph"];

// Social previews show about two lines, so long page text is cut at a word boundary.
function summary(text: string, max = 200) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, clean.lastIndexOf(" ", max - 1)).replace(/[,;:.]$/, "") + "…";
}

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const text = summary(description);
  return {
    title,
    description: text,
    alternates: { canonical: path },
    openGraph: { ...openGraph, title: `${title} | ${siteName}`, description: text, url: path },
  };
}
