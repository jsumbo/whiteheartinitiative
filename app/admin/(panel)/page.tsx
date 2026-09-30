import Link from "next/link";
import { collections, docs } from "@/lib/admin/schema";
import { store } from "@/lib/store";

export default async function Dashboard() {
  const counts = await Promise.all(collections.map(async (c) => (await store.listItems(c.name)).length));
  return (
    <>
      <h1 className="text-3xl font-black text-forest">Edit the website</h1>
      <p className="mt-2 text-stone-700">Pick what you want to change. Saved changes show on the website straight away.</p>

      <h2 className="mt-8 mb-3 text-sm font-bold tracking-[0.15em] text-stone-600 uppercase">Lists</h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {collections.map((c, i) => (
          <li key={c.name}>
            <Link href={`/admin/${c.name}`} className="block h-full border-2 border-stone-200 bg-white p-4 hover:border-forest">
              <span className="block text-lg font-black text-forest">{c.label}</span>
              <span className="text-sm text-stone-600">
                {counts[i]} {counts[i] === 1 ? c.singular : c.name === "team" ? "people" : `${c.singular}s`}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 mb-3 text-sm font-bold tracking-[0.15em] text-stone-600 uppercase">Pages and settings</h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {docs.map((d) => (
          <li key={d.key}>
            <Link href={`/admin/pages/${d.key}`} className="block h-full border-2 border-stone-200 bg-white p-4 hover:border-forest">
              <span className="block text-lg font-black text-forest">{d.label}</span>
              <span className="text-sm text-stone-600">{d.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
