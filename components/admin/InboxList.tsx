"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { smallBtn } from "./fields";

type Entry = { id: string; name: string; receivedAt: string; details: { label: string; value: string }[] };

const when = (iso: string) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

export function InboxList({ box, singular, plural, entries: initial }: { box: string; singular: string; plural: string; entries: Entry[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initial);
  const [error, setError] = useState("");

  async function remove(entry: Entry) {
    if (!confirm(`Delete the ${singular} from ${entry.name || "this person"}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/inbox/${box}/${entry.id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) return setError("Could not delete. Please try again.");
    setEntries((list) => list.filter((e) => e.id !== entry.id));
    router.refresh();
  }

  if (entries.length === 0) return <p className="bg-stone-100 p-6 text-center">No {plural} yet.</p>;

  return (
    <>
      {error && (
        <p role="alert" className="mb-3 font-bold text-red-800">
          {error}
        </p>
      )}
      <ul className="grid gap-3">
        {entries.map((e) => (
          <li key={e.id} className="border-2 border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-lg font-black text-forest">{e.name || "(no name)"}</p>
              <p className="text-sm text-stone-600">{when(e.receivedAt)}</p>
            </div>
            <dl className="mt-2 grid gap-1 sm:grid-cols-[10rem_1fr]">
              {e.details.map((d) => (
                <div key={d.label} className="contents">
                  <dt className="text-sm font-bold text-stone-600">{d.label}</dt>
                  <dd className="break-words whitespace-pre-line">
                    {d.label === "Email" ? (
                      <a href={`mailto:${d.value}`} className="text-forest underline underline-offset-4">
                        {d.value}
                      </a>
                    ) : (
                      d.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <button type="button" className={`${smallBtn} mt-3 text-red-800`} onClick={() => remove(e)}>
              Delete<span className="sr-only"> {singular} from {e.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
