import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InboxList } from "@/components/admin/InboxList";
import { getInboxDef } from "@/lib/admin/inbox";
import { store } from "@/lib/store";

export async function generateMetadata(props: PageProps<"/admin/inbox/[box]">): Promise<Metadata> {
  return { title: getInboxDef((await props.params).box)?.label ?? "Inbox" };
}

export default async function InboxPage(props: PageProps<"/admin/inbox/[box]">) {
  const def = getInboxDef((await props.params).box);
  if (!def) notFound();

  const items = (await store.listItems(def.name)).sort((a, b) => String(b.data.receivedAt ?? "").localeCompare(String(a.data.receivedAt ?? "")));
  const entries = items.map(({ id, data }) => ({
    id,
    name: String(data.name ?? ""),
    receivedAt: String(data.receivedAt ?? ""),
    details: def.fields
      .map((f) => ({ label: f.label, value: Array.isArray(data[f.name]) ? (data[f.name] as unknown[]).join(", ") : String(data[f.name] ?? "") }))
      .filter((d) => d.value),
  }));

  return (
    <>
      <Link href="/admin" className="text-sm font-bold text-forest underline underline-offset-4">← All sections</Link>
      <h1 className="mt-3 text-3xl font-black text-forest">{def.label}</h1>
      <p className="mt-1 mb-6 text-stone-700">{def.description}</p>
      <InboxList box={def.name} singular={def.singular} plural={def.plural} entries={entries} />
    </>
  );
}
