import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Editor } from "@/components/admin/Editor";
import { collectionPaths } from "@/lib/admin/links";
import { loadRefs } from "@/lib/admin/refs";
import { getCollectionDef } from "@/lib/admin/schema";
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

  return (
    <>
      <Link href={`/admin/${def.name}`} className="text-sm font-bold text-forest underline underline-offset-4">← {def.label}</Link>
      <h1 className="mt-3 mb-6 text-3xl font-black break-words text-forest">Edit {heading}</h1>
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
          viewHref={collectionPaths[def.name]}
        />
      </div>
    </>
  );
}
