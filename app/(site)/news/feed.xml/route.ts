import { getPosts } from "@/lib/content";
import { siteName, siteUrl } from "@/lib/site";

// RSS feed of published news posts, for feed readers and other sites.
const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const posts = (await getPosts()).slice(0, 30);
  const items = posts
    .map((p) => {
      const url = `${siteUrl}/news/${p.slug}`;
      const date = p.date ? new Date(p.date + "T12:00:00Z").toUTCString() : "";
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid>${date ? `<pubDate>${date}</pubDate>` : ""}<description>${esc(p.summary)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(siteName)} news</title><link>${siteUrl}/news</link><description>News and stories from ${esc(siteName)}.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
