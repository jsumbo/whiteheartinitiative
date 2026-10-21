import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/PostArticle";
import { isSignedIn } from "@/lib/admin/auth";
import { getPostForPreview, getProjects } from "@/lib/content";

// Lets a signed-in editor see a post, including drafts, exactly as it will look before publishing.
export const metadata: Metadata = { title: "Post preview", robots: { index: false, follow: false } };

export default async function PostPreview(props: PageProps<"/news/preview/[id]">) {
  if (!(await isSignedIn())) notFound();
  const { id } = await props.params;
  const post = await getPostForPreview(id);
  if (!post) notFound();
  const project = (await getProjects()).find((p) => p.id === post.project);

  return (
    <>
      <div role="status" className="bg-gold text-ink">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="font-bold">
            {post.status === "published" ? "Preview. This post is published." : "Preview. This draft is not on the website yet."}
          </p>
          <Link href={`/admin/posts/${post.id}`} className="font-bold underline underline-offset-4">Back to editing</Link>
        </div>
      </div>
      <PostArticle post={post} project={project} />
    </>
  );
}
