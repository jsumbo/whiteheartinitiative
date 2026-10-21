import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemList, type Row } from "@/components/admin/ItemList";
import { collectionPaths } from "@/lib/admin/links";
import { loadRefs } from "@/lib/admin/refs";
import { getCollectionDef, type CollectionName } from "@/lib/admin/schema";
import { formatDate } from "@/lib/content";
import { store, type Data } from "@/lib/store";

export async function generateMetadata(props: PageProps<"/admin/[collection]">): Promise<Metadata> {
  return { title: getCollectionDef((await props.params).collection)?.label ?? "List" };
}

const s = (d: Data, k: string) => String(d[k] ?? "");

// The grey line under each entry's name.
const subtitles: Record<CollectionName, (d: Data, refTitle: string) => string> = {
  projects: (d) => s(d, "tagline"),
  focus: (d) => s(d, "description").slice(0, 90),
  team: (d) => s(d, "position"),
  gallery: (d, project) => [d.date ? formatDate(s(d, "date")) : "", project].filter(Boolean).join(" · "),
  media: (d) => [s(d, "source"), d.date ? formatDate(s(d, "date")) : ""].filter(Boolean).join(" · "),
};

export default async function CollectionPage(props: PageProps<"/admin/[collection]">) {
  const def = getCollectionDef((await props.params).collection);
  if (!def) notFound();

  let items = await store.listItems(def.name);
  if (def.sort === "date") items = items.sort((a, b) => s(b.data, "date").localeCompare(s(a.data, "date")));

  // A "ref" field, like the project a gallery photo belongs to, becomes the list's filter.
  const refField = def.fields.find((f) => f.type === "ref");
  const refOptions = refField ? ((await loadRefs([refField]))[refField.collection] ?? []) : [];

  const rows: Row[] = items.map(({ id, data }) => {
    const group = refField ? s(data, refField.name) : "";
    return {
      id,
      title: s(data, def.titleField),
      image: def.imageField ? s(data, def.imageField) : "",
      subtitle: subtitles[def.name](data, refOptions.find((o) => o.id === group)?.title ?? ""),
      group: group || undefined,
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
            {def.sort === "manual" && " Drag the ⠿ handle or use the arrows to change the order."}{" "}
            <a href={collectionPaths[def.name]} target="_blank" rel="noopener" className="font-bold text-forest underline underline-offset-4">
              View on site
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {def.name === "gallery" && (
            <Link href={`/admin/${def.name}/upload`} className="border-2 border-forest px-5 py-2.5 font-bold text-forest hover:bg-stone-50">
              Upload many photos
            </Link>
          )}
          <Link href={`/admin/${def.name}/new`} className="bg-forest px-5 py-3 font-bold text-white hover:bg-olive">
            + Add {def.singular}
          </Link>
        </div>
      </div>
      <ItemList
        collection={def.name}
        rows={rows}
        sortable={def.sort === "manual"}
        singular={def.singular}
        plural={def.plural}
        groups={refField && refOptions.length ? { label: refField.label, options: refOptions } : undefined}
      />
    </>
  );
}
