import Link from "next/link";
import { inboxes } from "@/lib/admin/inbox";
import { collections, docs, type Field } from "@/lib/admin/schema";
import { store, type Data } from "@/lib/store";

type Todo = { text: string; href: string };

// Paths of text that still holds "[PLACEHOLDER ...]", e.g. "paymentDetails.0.value".
function placeholders(value: unknown, path = ""): string[] {
  if (typeof value === "string") return value.includes("PLACEHOLDER") ? [path] : [];
  if (Array.isArray(value)) return value.flatMap((v, i) => placeholders(v, `${path}.${i}`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => placeholders(v, path ? `${path}.${k}` : k));
  return [];
}

// Turns "paymentDetails.0.value" into the label of the top-level field, "Payment details".
const fieldLabel = (fields: Field[], path: string) => fields.find((f) => f.name === path.split(".")[0])?.label ?? path;

const isStock = (data: Data) => Object.values(data).some((v) => typeof v === "string" && /\/uploads\/stock-/.test(v));

export default async function Dashboard() {
  const [docData, items, inboxItems] = await Promise.all([
    Promise.all(docs.map((d) => store.getDoc(d.key))),
    Promise.all(collections.map((c) => store.listItems(c.name))),
    Promise.all(inboxes.map((b) => store.listItems(b.name))),
  ]);

  const todos: Todo[] = [];
  docs.forEach((d, i) => {
    const labels = [...new Set(placeholders(docData[i] ?? {}).map((p) => fieldLabel(d.fields, p)))];
    if (labels.length) todos.push({ text: `${d.label}: replace the placeholder text in ${labels.join(", ")}.`, href: `/admin/pages/${d.key}` });
  });
  collections.forEach((c, i) => {
    const list = items[i];
    const dummy = list.filter(({ id, data }) => id.startsWith("dummy-") || placeholders(data).length);
    if (dummy.length) todos.push({ text: `${c.label}: ${dummy.length} sample ${dummy.length === 1 ? c.singular : c.plural} to replace or delete.`, href: `/admin/${c.name}` });
    const stock = list.filter(({ data }) => isStock(data));
    if (stock.length) todos.push({ text: `${c.label}: ${stock.length} ${stock.length === 1 ? "uses a stock photo" : "use stock photos"}. Swap in your own.`, href: `/admin/${c.name}` });
  });

  const card = "block h-full border-2 border-stone-200 bg-white p-4 hover:border-forest";
  const heading = "mt-8 mb-3 text-sm font-bold tracking-[0.15em] text-stone-600 uppercase";

  return (
    <>
      <h1 className="text-3xl font-black text-forest">Edit the website</h1>
      <p className="mt-2 text-stone-700">Pick what you want to change. Saved changes show on the website straight away.</p>

      {todos.length > 0 && (
        <section aria-labelledby="todo-title" className="mt-8 border-l-4 border-gold bg-white p-4 sm:p-5">
          <h2 id="todo-title" className="text-lg font-black text-forest">
            Before launch: {todos.length} {todos.length === 1 ? "thing" : "things"} to finish
          </h2>
          <ul className="mt-3 grid gap-2">
            {todos.map((t) => (
              <li key={t.text}>
                <Link href={t.href} className="underline underline-offset-4 hover:text-forest">
                  {t.text}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className={heading}>Inbox</h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {inboxes.map((b, i) => (
          <li key={b.name}>
            <Link href={`/admin/inbox/${b.name}`} className={card}>
              <span className="block text-lg font-black text-forest">{b.label}</span>
              <span className="text-sm text-stone-600">
                {inboxItems[i].length} {inboxItems[i].length === 1 ? b.singular : b.plural}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className={heading}>Lists</h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {collections.map((c, i) => (
          <li key={c.name}>
            <Link href={`/admin/${c.name}`} className={card}>
              <span className="block text-lg font-black text-forest">{c.label}</span>
              <span className="text-sm text-stone-600">
                {items[i].length} {items[i].length === 1 ? c.singular : c.plural}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className={heading}>Pages and settings</h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {docs.map((d) => (
          <li key={d.key}>
            <Link href={`/admin/pages/${d.key}`} className={card}>
              <span className="block text-lg font-black text-forest">{d.label}</span>
              <span className="text-sm text-stone-600">{d.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
