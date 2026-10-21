import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPost, getPosts, getProjects } from "@/lib/content";
import { openGraph, pageMetadata } from "@/lib/site";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/news/[slug]">): Promise<Metadata> {
  const post = await getPost((await props.params).slug);
  if (!post) return {};
  const meta = pageMetadata(`/news/${post.slug}`, post.title, post.summary);
  // Use the cover photo for link previews when there is one.
  return post.cover
    ? { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: post.date, images: [{ url: post.cover, alt: post.coverAlt }] } }
    : { ...meta, openGraph: { ...openGraph, ...meta.openGraph, type: "article", publishedTime: post.date } };
}

export default async function PostPage(props: PageProps<"/news/[slug]">) {
  const post = await getPost((await props.params).slug);
  if (!post) notFound();
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const project = projects.find((p) => p.id === post.project);
  const more = posts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article>
      <header className="bg-forest text-white">
        <div className="wrap py-12 md:py-16">
          <div className="max-w-4xl">
          <Link href="/news" className="font-bold text-gold-light underline underline-offset-4">← All news</Link>
          <h1 className="mt-6 text-[clamp(2rem,6vw,3.75rem)] leading-[1.05] font-black tracking-tight">{post.title}</h1>
          <p className="mt-4 text-sm font-bold tracking-[0.12em] text-white/80 uppercase">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {project && (
              <>
                {" · "}
                <Link href={`/projects#${project.slug}`} className="underline underline-offset-4">{project.name}</Link>
              </>
            )}
          </p>
          </div>
        </div>
      </header>

      {post.cover && (
        <div className="wrap pt-8 md:pt-12">
          <div className="relative aspect-[16/9] w-full max-w-4xl bg-olive">
            <Image src={post.cover} alt={post.coverAlt} fill sizes="(min-width: 896px) 896px, 100vw" preload className="object-cover" />
          </div>
        </div>
      )}

      {/* Cleaned on save and again here (lib/sanitize.ts), so only safe formatting reaches the page. */}
      <div className="wrap py-10 md:py-14">
        <div className="post-body max-w-[42rem]" dangerouslySetInnerHTML={{ __html: post.body }} />
      </div>

      {more.length > 0 && (
        <aside aria-labelledby="more-title" className="bg-paper">
          <div className="wrap py-12 md:py-16">
            <h2 id="more-title" className="display-sm text-forest">more news.</h2>
            <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <li key={p.id}>
                  <p className="text-sm font-bold tracking-[0.12em] text-olive uppercase"><time dateTime={p.date}>{formatDate(p.date)}</time></p>
                  <h3 className="mt-1 text-xl leading-snug font-black text-forest">
                    <Link href={`/news/${p.slug}`} className="hover:underline">{p.title}</Link>
                  </h3>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </article>
  );
}
