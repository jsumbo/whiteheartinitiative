import type { Metadata } from "next";
import Link from "next/link";
import { AdminIcon, type IconName } from "@/components/admin/AdminIcon";
import { QuickDraft } from "@/components/admin/QuickDraft";
import { collections, docs, type CollectionName, type Field } from "@/lib/admin/schema";
import { formatDate } from "@/lib/content";
import { store, type Data, type Item } from "@/lib/store";

export const metadata: Metadata = { title: "Overview" };

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
const s = (d: Data, k: string) => String(d[k] ?? "");
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const withinDays = (iso: string, days: number) => Date.now() - new Date(iso).getTime() < days * 86_400_000;

function ago(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days < 1) return "Today";
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-days, "day");
}

// Tinted backgrounds for the icon squares, as in a stats dashboard.
const tints = ["bg-forest/10 text-forest", "bg-gold-light/40 text-olive", "bg-emerald-100 text-emerald-800", "bg-amber-100 text-amber-800"];

const card = "rounded-xl border border-stone-200 bg-white shadow-sm";

export default async function Overview() {
  const [docData, lists, messages] = await Promise.all([
    Promise.all(docs.map((d) => store.getDoc(d.key))),
    Promise.all(collections.map((c) => store.listItems(c.name))),
    store.listItems("messages"),
  ]);
  const items = Object.fromEntries(collections.map((c, i) => [c.name, lists[i]])) as Record<CollectionName, Item[]>;

  const posts = [...items.posts].sort((a, b) => s(b.data, "date").localeCompare(s(a.data, "date")));
  const published = posts.filter((p) => s(p.data, "status") === "published").length;
  const latestMessages = [...messages].sort((a, b) => s(b.data, "receivedAt").localeCompare(s(a.data, "receivedAt"))).slice(0, 4);
  const newMessages = messages.filter((m) => withinDays(s(m.data, "receivedAt"), 7)).length;

  const todos: Todo[] = [];
  docs.forEach((d, i) => {
    const labels = [...new Set(placeholders(docData[i] ?? {}).map((p) => fieldLabel(d.fields, p)))];
    if (labels.length) todos.push({ text: `${d.label}: replace the placeholder text in ${labels.join(", ")}.`, href: `/admin/pages/${d.key}` });
  });
  collections.forEach((c) => {
    const list = items[c.name];
    const dummy = list.filter(({ id, data }) => id.startsWith("dummy-") || placeholders(data).length);
    if (dummy.length) todos.push({ text: `${c.label}: ${dummy.length} sample ${dummy.length === 1 ? c.singular : c.plural} to replace or delete.`, href: `/admin/${c.name}` });
    const stock = list.filter(({ data }) => isStock(data));
    if (stock.length) todos.push({ text: `${c.label}: ${stock.length} ${stock.length === 1 ? "uses a stock photo" : "use stock photos"}. Swap in your own.`, href: `/admin/${c.name}` });
  });

  const stats: { icon: IconName; value: number; label: string; detail: string; href: string }[] = [
    { icon: "news", value: posts.length, label: "News posts", detail: `${published} published · ${posts.length - published} ${posts.length - published === 1 ? "draft" : "drafts"}`, href: "/admin/posts" },
    { icon: "gallery", value: items.gallery.length, label: "Gallery photos", detail: "On the Media page", href: "/admin/gallery" },
    { icon: "messages", value: messages.length, label: "Messages", detail: newMessages ? `${newMessages} in the last 7 days` : "None in the last 7 days", href: "/admin/inbox/messages" },
    { icon: "projects", value: items.projects.length, label: "Projects", detail: "On the Projects page", href: "/admin/projects" },
  ];
  const small: { icon: IconName; value: number; label: string; href: string }[] = [
    { icon: "programs", value: items.focus.length, label: "Programs", href: "/admin/focus" },
    { icon: "team", value: items.team.length, label: "Team members", href: "/admin/team" },
    { icon: "links", value: items.media.length, label: "Media links", href: "/admin/media" },
    { icon: "pages", value: docs.length - 1, label: "Pages", href: "/admin/pages" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-forest sm:text-4xl">Overview</h1>
          <p className="mt-1 text-stone-700">What&apos;s on the website, and what needs doing. Saved changes go live straight away.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/gallery/upload" className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 font-bold text-forest hover:border-forest">
            <AdminIcon name="gallery" />
            Upload photos
          </Link>
          <Link href="/admin/posts/new" className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 font-bold text-white hover:bg-olive">
            <AdminIcon name="plus" />
            New post
          </Link>
        </div>
      </div>

      <h2 className="sr-only">At a glance</h2>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((st, i) => (
          <li key={st.label}>
            <Link href={st.href} className={`${card} block h-full p-4 hover:border-forest sm:p-5`}>
              <span className={`inline-flex size-11 items-center justify-center rounded-lg ${tints[i % tints.length]}`}>
                <AdminIcon name={st.icon} />
              </span>
              <span className="mt-4 block text-2xl font-black text-ink sm:text-3xl">{st.value}</span>
              <span className="block font-semibold text-stone-700">{st.label}</span>
              <span className="mt-1 block text-sm text-stone-600">{st.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {small.map((st, i) => (
          <li key={st.label}>
            <Link href={st.href} className={`${card} flex items-center gap-3 p-4 hover:border-forest`}>
              <span className={`inline-flex size-9 items-center justify-center rounded-lg ${tints[(i + 2) % tints.length]}`}>
                <AdminIcon name={st.icon} className="size-[18px]" />
              </span>
              <span className="flex-1 font-semibold text-stone-700">{st.label}</span>
              <span className="text-xl font-black text-ink">{st.value}</span>
            </Link>
          </li>
        ))}
      </ul>

      {todos.length > 0 && (
        <section aria-labelledby="todo-title" className={`${card} mt-8 border-l-4 border-l-gold p-5`}>
          <h2 id="todo-title" className="text-lg font-black text-forest">
            Before launch: {plural(todos.length, "thing", "things")} to finish
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

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_24rem]">
        <section aria-labelledby="news-title" className={card}>
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
            <h2 id="news-title" className="text-lg font-black text-forest">Latest news</h2>
            <Link href="/admin/posts" className="inline-flex items-center gap-1 text-sm font-bold text-stone-600 hover:text-forest">
              All posts <span aria-hidden="true">→</span>
            </Link>
          </div>
          {posts.length === 0 ? (
            <p className="p-5 text-stone-600">No posts yet. Write your first one with Quick draft.</p>
          ) : (
            <ul className="divide-y divide-stone-200">
              {posts.slice(0, 5).map((p) => {
                const live = s(p.data, "status") === "published";
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                    <Link href={`/admin/posts/${p.id}`} className="min-w-0 flex-1 font-semibold break-words hover:text-forest hover:underline">
                      {s(p.data, "title") || "(no title)"}
                    </Link>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${live ? "bg-emerald-100 text-emerald-900" : "bg-stone-200 text-stone-700"}`}>
                      {live ? "Published" : "Draft"}
                    </span>
                    <span className="w-28 text-right text-sm text-stone-600">{p.data.date ? formatDate(s(p.data, "date")) : ""}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="messages-title" className={`${card} xl:row-span-2 xl:self-start`}>
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
            <h2 id="messages-title" className="flex items-center gap-2 text-lg font-black text-forest">
              <AdminIcon name="messages" />
              Latest messages
            </h2>
            <Link href="/admin/inbox/messages" className="inline-flex items-center gap-1 text-sm font-bold text-stone-600 hover:text-forest">
              All messages <span aria-hidden="true">→</span>
            </Link>
          </div>
          {latestMessages.length === 0 ? (
            <p className="p-5 text-stone-600">No messages yet. Messages sent with the contact form show here.</p>
          ) : (
            <ul className="divide-y divide-stone-200">
              {latestMessages.map((m) => (
                <li key={m.id} className="px-5 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold break-words">{s(m.data, "name") || "(no name)"}</p>
                    <p className="shrink-0 text-sm text-stone-600">{ago(s(m.data, "receivedAt"))}</p>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-stone-700">{s(m.data, "message")}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="draft-title" className={`${card} p-5`}>
          <h2 id="draft-title" className="mb-3 text-lg font-black text-forest">Quick draft</h2>
          <QuickDraft />
        </section>
      </div>
    </>
  );
}
