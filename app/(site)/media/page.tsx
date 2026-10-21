import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import Script from "next/script";
import { SocialLinks } from "@/components/SocialLinks";
import { formatDate, getMediaLinks, getMediaPage, getPhotos, getProjects, getSettings, type MediaLink } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/media", "Media", (await getMediaPage()).intro);
}

function LinkList({ links }: { links: MediaLink[] }) {
  return (
    <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {links.map((m) => (
        <li key={m.id} className="flex min-w-0 flex-col border-t-4 border-gold bg-white">
          {m.image && (
            <div className="relative aspect-[16/9] w-full bg-olive">
              <Image src={m.image} alt={m.imageAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
          )}
          <div className="flex flex-1 flex-col p-5">
            <p className="text-sm font-bold tracking-[0.12em] text-olive uppercase">
              {m.source}
              {m.date && <> · <time dateTime={m.date}>{formatDate(m.date)}</time></>}
            </p>
            <h3 className="mt-2 flex-1 text-xl leading-snug font-black text-forest">{m.title}</h3>
            <a href={m.url} target="_blank" rel="noopener" className="mt-4 self-start font-bold text-forest underline decoration-gold decoration-2 underline-offset-4">
              {m.kind === "news" ? "Read the article" : m.kind === "video" ? "Watch the video" : "See the post"}
              <span className="sr-only">: {m.title} (opens in a new tab)</span>
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function MediaPage() {
  const [{ intro }, links, photos, projects, settings] = await Promise.all([getMediaPage(), getMediaLinks(), getPhotos(), getProjects(), getSettings()]);
  const news = links.filter((l) => l.kind === "news");
  const posts = links.filter((l) => l.kind !== "news");
  const tagged = projects.filter((p) => photos.some((ph) => ph.project === p.id));

  return (
    <>
      <div className="bg-forest text-white">
        <div className="wrap py-14 md:py-20">
          <h1 className="display">media.</h1>
          <p className="prose-lg mt-6">{intro}</p>
          <p className="mt-4 text-lg">
            For our own stories and updates, see{" "}
            <Link href="/news" className="font-bold text-gold-light underline underline-offset-4">News</Link>.
          </p>
        </div>
      </div>

      {news.length > 0 && (
        <section aria-labelledby="news-title">
          <div className="wrap py-14 md:py-20">
            <h2 id="news-title" className="display-sm text-forest">in the news.</h2>
            <LinkList links={news} />
          </div>
        </section>
      )}

      <section id="photos" aria-labelledby="photos-title" className="scroll-mt-4 bg-paper">
        <div className="wrap py-14 md:py-20">
        <h2 id="photos-title" className="display-sm text-forest">photos.</h2>
        {tagged.length > 0 && (
          // Invisible (but taking up its space) until the script runs, so it never shows as a broken control.
          <div id="gallery-filter" className="invisible mt-8">
            <p id="filter-label" className="mb-2 font-bold">Show photos from</p>
            <div role="group" aria-labelledby="filter-label" className="flex flex-wrap gap-2">
              <button type="button" data-filter="all" aria-pressed="true" className="filter-btn">All</button>
              {tagged.map((p) => (
                <button key={p.id} type="button" data-filter={p.id} aria-pressed="false" className="filter-btn">
                  {p.name}
                </button>
              ))}
            </div>
            <p id="filter-status" className="sr-only" aria-live="polite" />
          </div>
        )}

        {photos.length === 0 ? (
          <p className="mt-8 text-lg">No photos yet.</p>
        ) : (
          <ul id="gallery-grid" className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
            {photos.map((photo) => {
              const { props: full } = getImageProps({ src: photo.image, alt: photo.alt, fill: true, sizes: "100vw" });
              return (
                <li key={photo.id} data-project={photo.project || ""}>
                  <a href={full.src} data-lightbox data-srcset={full.srcSet} data-alt={photo.alt} className="relative block aspect-square bg-olive">
                    <Image src={photo.image} alt={photo.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover" />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
        </div>
      </section>

      <section aria-labelledby="posts-title" className="wrap py-14 md:py-20">
        <h2 id="posts-title" className="display-sm text-forest">on social media.</h2>
        <p className="prose-lg mt-4">
          Follow our work at <strong>{settings.handle}</strong>
        </p>
        <SocialLinks className="mt-4 text-lg" />
        {posts.length > 0 && <LinkList links={posts} />}
      </section>

      <dialog id="lightbox" className="lightbox" aria-label="Photo viewer">
        <div className="flex h-full flex-col">
          <div className="flex justify-end p-3">
            <button type="button" data-close className="border border-white/60 px-4 py-2 font-bold">Close</button>
          </div>
          <div data-stage className="flex flex-1 items-center justify-center px-3">
            {/* Filled by gallery.js with the optimized /_next/image URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" />
          </div>
          <div className="flex justify-between p-3">
            <button type="button" data-prev className="border border-white/60 px-4 py-2 font-bold">Previous</button>
            <button type="button" data-next className="border border-white/60 px-4 py-2 font-bold">Next</button>
          </div>
        </div>
      </dialog>

      <Script src="/js/gallery.js" strategy="lazyOnload" />
    </>
  );
}
