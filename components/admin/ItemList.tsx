"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type Row = { id: string; title: string; subtitle?: string; image?: string };

export function ItemList({ collection, rows: initialRows, sortable, singular }: { collection: string; rows: Row[]; sortable: boolean; singular: string }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [error, setError] = useState("");

  async function move(from: number, to: number) {
    const next = [...rows];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setRows(next);
    setError("");
    const res = await fetch(`/api/admin/items/${collection}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((r) => r.id) }),
    });
    if (!res.ok) {
      setRows(rows);
      setError("Could not change the order. Please try again.");
    } else router.refresh();
  }

  async function remove(row: Row) {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/items/${collection}/${row.id}`, { method: "DELETE" });
    if (!res.ok) return setError("Could not delete. Please try again.");
    setRows((r) => r.filter((x) => x.id !== row.id));
    router.refresh();
  }

  if (rows.length === 0) return <p className="bg-stone-100 p-6 text-center">Nothing here yet. Use the button above to add a {singular}.</p>;

  const btn = "border-2 border-stone-300 bg-white px-3 py-1.5 text-sm font-bold text-forest hover:border-forest disabled:opacity-40";

  return (
    <>
      {error && (
        <p role="alert" className="mb-3 font-bold text-red-800">
          {error}
        </p>
      )}
      <ul className="divide-y-2 divide-stone-200 border-2 border-stone-200 bg-white">
        {rows.map((row, i) => (
          <li key={row.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden bg-stone-100 text-xs text-stone-500">
                {row.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  "No photo"
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold">{row.title || "(untitled)"}</p>
                {row.subtitle && <p className="truncate text-sm text-stone-600">{row.subtitle}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {sortable && (
                <>
                  <button type="button" className={btn} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Move ${row.title} up`}>
                    ↑
                  </button>
                  <button type="button" className={btn} disabled={i === rows.length - 1} onClick={() => move(i, i + 1)} aria-label={`Move ${row.title} down`}>
                    ↓
                  </button>
                </>
              )}
              <Link href={`/admin/${collection}/${row.id}`} className={btn}>
                Edit<span className="sr-only"> {row.title}</span>
              </Link>
              <button type="button" className={`${btn} text-red-800`} onClick={() => remove(row)}>
                Delete<span className="sr-only"> {row.title}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
