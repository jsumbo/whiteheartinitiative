import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatDate, getPosts, getProjects } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

const meta = pageMetadata("/news", "News", "News and stories from White Heart Initiative's projects in Liberia.");
export const metadata: Metadata = { ...meta, alternates: { ...meta.alternates, types: { "application/rss+xml": "/news/feed.xml" } } };

export default async function NewsPage() {
  const [posts, projects] = await Promise.all([getPosts(), getProjects()]);
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name;
  const [lead, ...rest] = posts;

  return (
    <>
      <div className="bg-forest text-white">
        <div className="wrap py-14 md:py-20">
          <h1 className="display">news.</h1>
          <p className="prose-lg mt-6">Stories and updates from Jumpstart, Freedom&rsquo;s Future and our outreach.</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="wrap py-14 md:py-20">
          <p className="text-lg">
            No posts yet. In the meantime, see <Link href="/media" className="font-bold text-forest underline decoration-gold decoration-2 underline-offset-4">media coverage and photos</Link>.
          </p>
        </div>
      ) : (
        <div className="wrap py-14 md:py-20">
          {/* The newest post is shown large; the rest in a grid. */}
          <article className="grid gap-6 md:grid-cols-2 md:items-center md:gap-10">
            {lead.cover && (
              <div className="relative aspect-[16/10] w-full bg-olive">
                <Image src={lead.cover} alt={lead.coverAlt} fill sizes="(min-width: 768px) 50vw, 100vw" preload className="object-cover" />
              </div>
            )}
            <div className={lead.cover ? "" : "md:col-span-2"}>
              <p className="text-sm font-bold tracking-[0.12em] text-olive uppercase">
                <time dateTime={lead.date}>{formatDate(lead.date)}</time>
                {projectName(lead.project) && <> · {projectName(lead.project)}</>}
              </p>
              <h2 className="mt-2 text-[clamp(1.75rem,5vw,3rem)] leading-tight font-black text-forest">
                <Link href={`/news/${lead.slug}`} className="hover:underline">{lead.title}</Link>
              </h2>
              <p className="mt-4 text-lg">{lead.summary}</p>
              <Link href={`/news/${lead.slug}`} className="mt-5 inline-block font-bold text-forest underline decoration-gold decoration-2 underline-offset-4">
                Read the full story<span className="sr-only">: {lead.title}</span>
              </Link>
            </div>
          </article>

          {rest.length > 0 && (
            <ul className="mt-14 grid gap-8 border-t-2 border-forest pt-10 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <li key={p.id} className="flex flex-col">
                  {p.cover && (
                    <div className="relative mb-4 aspect-[16/10] w-full bg-olive">
                      <Image src={p.cover} alt={p.coverAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                    </div>
                  )}
                  <p className="text-sm font-bold tracking-[0.12em] text-olive uppercase">
                    <time dateTime={p.date}>{formatDate(p.date)}</time>
                  </p>
                  <h3 className="mt-1 text-xl leading-snug font-black text-forest">
                    <Link href={`/news/${p.slug}`} className="hover:underline">{p.title}</Link>
                  </h3>
                  <p className="mt-2 flex-1">{p.summary}</p>
                  <Link href={`/news/${p.slug}`} className="mt-3 self-start font-bold text-forest underline decoration-gold decoration-2 underline-offset-4">
                    Read the full story<span className="sr-only">: {p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
