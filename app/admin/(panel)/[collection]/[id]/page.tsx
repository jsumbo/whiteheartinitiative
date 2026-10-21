import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Editor } from "@/components/admin/Editor";
import { collectionPaths } from "@/lib/admin/links";
import { loadRefs } from "@/lib/admin/refs";
import { getCollectionDef } from "@/lib/admin/schema";
import { getPostForPreview } from "@/lib/content";
import { store } from "@/lib/store";

export async function generateMetadata(props: PageProps<"/admin/[collection]/[id]">): Promise<Metadata> {
  return { title: `Edit ${getCollectionDef((await props.params).collection)?.singular ?? "entry"}` };
}

export default async function EditItem(props: PageProps<"/admin/[collection]/[id]">) {
  const { collection, id } = await props.params;
  const def = getCollectionDef(collection);
  if (!def) notFound();
  const [item, refs] = await Promise.all([store.getItem(def.name, id), loadRefs(def.fields)]);
  if (!item) notFound();
  const title = String(item.data[def.titleField] ?? "") || def.singular;
  const heading = def.name === "gallery" ? "photo" : title;
  // News posts link to their own page (when published) and to a preview that also works for drafts.
  const post = def.name === "posts" ? await getPostForPreview(item.id) : null;
  const postHref = post?.status === "published" ? `/news/${post.slug}` : undefined;

  return (
    <>
      <Link href={`/admin/${def.name}`} className="text-sm font-bold text-forest underline underline-offset-4">← {def.label}</Link>
      <h1 className="mt-3 mb-6 text-3xl font-black break-words text-forest">Edit {heading}</h1>
      {def.name === "posts" && (
        <p className="-mt-3 mb-6 flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold">
          <span className={post?.status === "published" ? "text-forest" : "text-stone-600"}>
            {post?.status === "published" ? "Published" : "Draft: not on the website"}
          </span>
          <a href={`/news/preview/${item.id}`} target="_blank" rel="noopener" className="text-forest underline underline-offset-4">
            Preview this post<span className="sr-only"> (opens in a new tab)</span>
          </a>
          {postHref && (
            <a href={postHref} target="_blank" rel="noopener" className="text-forest underline underline-offset-4">
              View on the website<span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </p>
      )}
      <div className="border-2 border-stone-200 bg-white p-4 pb-0 sm:p-6 sm:pb-0">
        <Editor
          key={item.id}
          fields={def.fields}
          initial={item.data}
          endpoint={`/api/admin/items/${def.name}/${item.id}`}
          method="PUT"
          refs={refs}
          backTo={`/admin/${def.name}`}
          deleteEndpoint={`/api/admin/items/${def.name}/${item.id}`}
          deleteLabel={`"${heading}"`}
          viewHref={def.name === "posts" ? (postHref ?? `/news/preview/${item.id}`) : collectionPaths[def.name]}
        />
      </div>
    </>
  );
}
