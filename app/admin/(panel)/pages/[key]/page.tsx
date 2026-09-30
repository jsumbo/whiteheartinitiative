import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Editor } from "@/components/admin/Editor";
import { getDocDef } from "@/lib/admin/schema";
import { store } from "@/lib/store";

export async function generateMetadata(props: PageProps<"/admin/pages/[key]">): Promise<Metadata> {
  return { title: getDocDef((await props.params).key)?.label ?? "Edit" };
}

export default async function EditDoc(props: PageProps<"/admin/pages/[key]">) {
  const def = getDocDef((await props.params).key);
  if (!def) notFound();
  const data = (await store.getDoc(def.key)) ?? {};

  return (
    <>
      <Link href="/admin" className="text-sm font-bold text-forest underline underline-offset-4">← All sections</Link>
      <h1 className="mt-3 text-3xl font-black text-forest">{def.label}</h1>
      <p className="mt-1 mb-6 text-stone-700">{def.description}</p>
      <div className="border-2 border-stone-200 bg-white p-4 pb-0 sm:p-6 sm:pb-0">
        <Editor key={def.key} fields={def.fields} initial={data} endpoint={`/api/admin/docs/${def.key}`} method="PUT" />
      </div>
    </>
  );
}
