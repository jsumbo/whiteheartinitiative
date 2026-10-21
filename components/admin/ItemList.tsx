"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { smallBtn } from "./fields";
import { moveItem, useSortable } from "./sortable";

export type Row = { id: string; title: string; subtitle?: string; image?: string; group?: string };

type Props = {
  collection: string;
  rows: Row[];
  sortable: boolean;
  singular: string;
  plural: string;
  // Options for the filter menu, e.g. projects for gallery photos.
  groups?: { label: string; options: { id: string; title: string }[] };
};

export function ItemList({ collection, rows: initialRows, sortable, singular, plural, groups }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");

  async function move(from: number, to: number) {
    if (saving) return;
    const before = rows;
    const next = moveItem(rows, from, to);
    setRows(next);
    setError("");
    setSaving(true);
    const res = await fetch(`/api/admin/items/${collection}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((r) => r.id) }),
    }).catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      setRows(before);
      setError("Could not change the order. Please try again.");
    } else router.refresh();
  }
  const sort = useSortable(move);

  async function remove(row: Row) {
    if (!confirm(`Delete "${row.title || singular}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/items/${collection}/${row.id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) return setError("Could not delete. Please try again.");
    setRows((r) => r.filter((x) => x.id !== row.id));
    router.refresh();
  }

  if (rows.length === 0) return <p className="bg-stone-100 p-6 text-center">Nothing here yet. Use the button above to add a {singular}.</p>;

  const q = query.trim().toLowerCase();
  const shown = rows.filter(
    (r) => (!q || `${r.title} ${r.subtitle ?? ""}`.toLowerCase().includes(q)) && (!group || (group === "-" ? !r.group : r.group === group)),
  );
  // Reordering a filtered list would be confusing, so the arrows only show for the full list.
  const canSort = sortable && shown.length === rows.length;
  const showTools = rows.length > 8 || groups;
  const field = "border-2 border-stone-300 bg-white px-3 py-2 text-base focus:border-forest focus:outline-none";

  return (
    <>
      {showTools && (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="grow">
            <span className="block text-sm font-bold">Search</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} className={`${field} w-full`} />
          </label>
          {groups && (
            <label>
              <span className="block text-sm font-bold">{groups.label}</span>
              <select value={group} onChange={(e) => setGroup(e.target.value)} className={field}>
                <option value="">All</option>
                {groups.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
                <option value="-">None</option>
              </select>
            </label>
          )}
          <p className="pb-2 text-sm text-stone-600" aria-live="polite">
            {shown.length === rows.length ? `${rows.length} ${rows.length === 1 ? singular : plural}` : `Showing ${shown.length} of ${rows.length}`}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mb-3 font-bold text-red-800">
          {error}
        </p>
      )}
      {sortable && !canSort && <p className="mb-3 text-sm text-stone-600">Clear the search to change the order.</p>}
      {shown.length === 0 ? (
        <p className="bg-stone-100 p-6 text-center">No {plural} match.</p>
      ) : (
        <ul className="divide-y-2 divide-stone-200 border-2 border-stone-200 bg-white">
          {shown.map((row, i) => (
            <li
              key={row.id}
              {...(canSort ? sort.item(i) : {})}
              className="flex flex-col gap-3 bg-white p-3 data-drop-target:outline-2 data-drop-target:outline-dashed data-drop-target:outline-forest sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {canSort && (
                  <span {...sort.handle(i)} aria-hidden="true" title="Drag to move" className="hidden cursor-grab touch-none px-1 text-xl text-stone-400 select-none hover:text-forest sm:block">
                    ⠿
                  </span>
                )}
                <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden bg-stone-100 text-xs text-stone-500">
                  {row.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    "No photo"
                  )}
                </div>
                <div className="min-w-0">
                  <Link href={`/admin/${collection}/${row.id}`} className="block truncate font-bold hover:underline">
                    {row.title || "(untitled)"}
                  </Link>
                  {row.subtitle && <p className="truncate text-sm text-stone-600">{row.subtitle}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {canSort && (
                  <>
                    <button type="button" className={smallBtn} disabled={i === 0 || saving} onClick={() => move(i, i - 1)} aria-label={`Move ${row.title} up`}>
                      ↑
                    </button>
                    <button type="button" className={smallBtn} disabled={i === rows.length - 1 || saving} onClick={() => move(i, i + 1)} aria-label={`Move ${row.title} down`}>
                      ↓
                    </button>
                  </>
                )}
                <Link href={`/admin/${collection}/${row.id}`} className={smallBtn}>
                  Edit<span className="sr-only"> {row.title}</span>
                </Link>
                <button type="button" className={`${smallBtn} text-red-800`} onClick={() => remove(row)}>
                  Delete<span className="sr-only"> {row.title}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
