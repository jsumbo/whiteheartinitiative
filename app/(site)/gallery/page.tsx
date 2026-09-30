import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import Script from "next/script";
import { getGalleryPage, getPhotos, getPrograms } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: getGalleryPage().intro,
};

export default function GalleryPage() {
  const photos = getPhotos();
  const programs = getPrograms();
  const tagged = programs.filter((p) => photos.some((ph) => ph.program === p.slug));

  return (
    <>
      <div className="bg-forest text-white">
        <div className="wrap py-14 md:py-20">
          <h1 className="display">gallery.</h1>
          <p className="prose-lg mt-6">{getGalleryPage().intro}</p>
        </div>
      </div>

      <div className="wrap py-10 md:py-14">
        {tagged.length > 0 && (
          // Invisible (but taking up its space) until the script runs, so it never shows as a broken control.
          <div id="gallery-filter" className="invisible mb-8">
            <p id="filter-label" className="mb-2 font-bold">Show photos from</p>
            <div role="group" aria-labelledby="filter-label" className="flex flex-wrap gap-2">
              <button type="button" data-filter="all" aria-pressed="true" className="filter-btn">All</button>
              {tagged.map((p) => (
                <button key={p.slug} type="button" data-filter={p.slug} aria-pressed="false" className="filter-btn">
                  {p.title}
                </button>
              ))}
            </div>
            <p id="filter-status" className="sr-only" aria-live="polite" />
          </div>
        )}

        {photos.length === 0 ? (
          <p className="text-lg">No photos yet.</p>
        ) : (
          <ul id="gallery-grid" className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
            {photos.map((photo, i) => {
              const { props: full } = getImageProps({ src: photo.image, alt: photo.alt, fill: true, sizes: "100vw" });
              return (
                <li key={photo.slug} data-program={photo.program || ""}>
                  <a
                    href={full.src}
                    data-lightbox
                    data-srcset={full.srcSet}
                    data-alt={photo.alt}
                    className="relative block aspect-square bg-olive"
                  >
                    <Image
                      src={photo.image}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      loading={i < 4 ? "eager" : "lazy"}
                      fetchPriority={i < 2 ? "high" : undefined}
                      className="object-cover"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
