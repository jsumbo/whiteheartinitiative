import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Editor } from "@/components/admin/Editor";
import { getCollectionDef } from "@/lib/admin/schema";
import { getPrograms } from "@/lib/content";

export async function generateMetadata(props: PageProps<"/admin/[collection]/new">): Promise<Metadata> {
  return { title: `Add ${getCollectionDef((await props.params).collection)?.singular ?? "entry"}` };
}

export default async function NewItem(props: PageProps<"/admin/[collection]/new">) {
  const def = getCollectionDef((await props.params).collection);
  if (!def) notFound();
  const programs = (await getPrograms()).map(({ id, title }) => ({ id, title }));
  const initial = def.name === "gallery" ? { date: new Date().toISOString().slice(0, 10) } : {};

  return (
    <>
      <Link href={`/admin/${def.name}`} className="text-sm font-bold text-forest underline underline-offset-4">← {def.label}</Link>
      <h1 className="mt-3 mb-6 text-3xl font-black text-forest">Add {def.singular}</h1>
      <div className="border-2 border-stone-200 bg-white p-4 pb-0 sm:p-6 sm:pb-0">
        <Editor fields={def.fields} initial={initial} endpoint={`/api/admin/items/${def.name}`} method="POST" programs={programs} backTo={`/admin/${def.name}`} />
      </div>
    </>
  );
}
