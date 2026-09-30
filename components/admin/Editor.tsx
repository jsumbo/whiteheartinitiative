"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Field } from "@/lib/admin/schema";
import { FieldInput, type ProgramOption, type Values } from "./fields";

type Props = {
  fields: Field[];
  initial: Values;
  // Where to send the form, e.g. PUT /api/admin/docs/home
  endpoint: string;
  method: "PUT" | "POST";
  programs?: ProgramOption[];
  // After saving a new entry, go back to this list.
  backTo?: string;
  deleteEndpoint?: string;
  deleteLabel?: string;
};

export function Editor({ fields, initial, endpoint, method, programs = [], backTo, deleteEndpoint, deleteLabel }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; message?: string }>({ kind: "idle" });

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function set(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }));
    setDirty(true);
    if (status.kind !== "saving") setStatus({ kind: "idle" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    try {
      const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Could not save. Please try again.");
      setDirty(false);
      if (method === "POST" && backTo) {
        router.push(backTo);
        router.refresh();
        return;
      }
      setStatus({ kind: "saved", message: "Saved. The website is updated." });
      router.refresh();
    } catch (err) {
      setStatus({ kind: "error", message: (err as Error).message });
    }
  }

  async function remove() {
    if (!deleteEndpoint || !confirm(`Delete ${deleteLabel ?? "this entry"}? This cannot be undone.`)) return;
    const res = await fetch(deleteEndpoint, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus({ kind: "error", message: data.error || "Could not delete. Please try again." });
      return;
    }
    setDirty(false);
    router.push(backTo ?? "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="grid gap-6">
      {fields.map((f) => (
        <FieldInput key={f.name} field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} programs={programs} />
      ))}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t-2 border-stone-200 bg-white px-4 py-3 sm:-mx-6 sm:px-6">
        <button type="submit" disabled={status.kind === "saving"} className="bg-forest px-6 py-3 font-bold text-white hover:bg-olive disabled:opacity-60">
          {status.kind === "saving" ? "Saving..." : method === "POST" ? "Add" : "Save changes"}
        </button>
        {deleteEndpoint && (
          <button type="button" onClick={remove} className="border-2 border-red-800 px-4 py-2.5 font-bold text-red-800 hover:bg-red-50">
            Delete
          </button>
        )}
        <p role="status" aria-live="polite" className={`font-bold ${status.kind === "error" ? "text-red-800" : "text-forest"}`}>
          {status.message ?? (dirty ? "You have unsaved changes." : "")}
        </p>
      </div>
    </form>
  );
}
