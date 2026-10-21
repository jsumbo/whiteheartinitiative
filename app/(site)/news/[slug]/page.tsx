import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/PostArticle";
import { getPost, getPosts, getProjects } from "@/lib/content";
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

  return <PostArticle post={post} project={project} more={more} />;
}
