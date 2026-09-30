import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemList } from "@/components/admin/ItemList";
import { getCollectionDef } from "@/lib/admin/schema";
import { getPrograms } from "@/lib/content";
import { store } from "@/lib/store";

export async function generateMetadata(props: PageProps<"/admin/[collection]">): Promise<Metadata> {
  return { title: getCollectionDef((await props.params).collection)?.label ?? "List" };
}

export default async function CollectionPage(props: PageProps<"/admin/[collection]">) {
  const def = getCollectionDef((await props.params).collection);
  if (!def) notFound();

  let items = await store.listItems(def.name);
  if (def.sort === "date") items = items.sort((a, b) => String(b.data.date ?? "").localeCompare(String(a.data.date ?? "")));
  const programs = def.name === "gallery" ? await getPrograms() : [];

  const rows = items.map(({ id, data }) => {
    const program = programs.find((p) => p.id === data.program)?.title;
    return {
      id,
      title: String(data[def.titleField] ?? ""),
      image: String(data[def.imageField] ?? ""),
      subtitle:
        def.name === "team" ? String(data.position ?? "")
        : def.name === "gallery" ? [data.date, program].filter(Boolean).join(" · ")
        : String(data.description ?? "").slice(0, 90),
    };
  });

  return (
    <>
      <Link href="/admin" className="text-sm font-bold text-forest underline underline-offset-4">← All sections</Link>
      <div className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-forest">{def.label}</h1>
          <p className="mt-1 text-stone-700">
            {def.description}
            {def.sort === "manual" && " Use the arrows to change the order."}
          </p>
        </div>
        <Link href={`/admin/${def.name}/new`} className="bg-forest px-5 py-3 font-bold text-white hover:bg-olive">
          + Add {def.singular}
        </Link>
      </div>
      <ItemList collection={def.name} rows={rows} sortable={def.sort === "manual"} singular={def.singular} />
    </>
  );
}
