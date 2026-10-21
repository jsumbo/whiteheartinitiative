"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Refs } from "@/lib/admin/refs";
import type { Field } from "@/lib/admin/schema";
import { FieldInput, missingFields, type Values } from "./fields";

type Props = {
  fields: Field[];
  initial: Values;
  // Where to send the form, e.g. PUT /api/admin/docs/home
  endpoint: string;
  method: "PUT" | "POST";
  refs?: Refs;
  // After saving a new entry, go back to this list.
  backTo?: string;
  deleteEndpoint?: string;
  deleteLabel?: string;
  // The public page this content shows on.
  viewHref?: string;
};

const LEAVE_MESSAGE = "You have unsaved changes. Leave this page without saving?";

export function Editor({ fields, initial, endpoint, method, refs = {}, backTo, deleteEndpoint, deleteLabel, viewHref }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(initial);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; message?: string }>({ kind: "idle" });

  // Warn before leaving with unsaved changes: closing the tab, and links inside the admin
  // (which change page without the browser's own warning).
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      if (!confirm(LEAVE_MESSAGE)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  function set(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }));
    setDirty(true);
    if (errors.size) setErrors((errs) => new Set([...errs].filter((p) => p !== name && !p.startsWith(`${name}.`))));
    if (status.kind !== "saving") setStatus({ kind: "idle" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const missing = missingFields(fields, values);
    if (missing.length) {
      setErrors(new Set(missing.map((m) => m.path)));
      setStatus({
        kind: "error",
        message: missing.length === 1 ? `Please fill in "${missing[0].label}".` : `Please fill in the ${missing.length} boxes marked in red.`,
      });
      const first = formRef.current?.querySelector<HTMLElement>(`[data-path="${CSS.escape(missing[0].path)}"]`);
      first?.scrollIntoView({ block: "center", behavior: "smooth" });
      first?.focus({ preventScroll: true });
      return;
    }

    setStatus({ kind: "saving" });
    try {
      const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setStatus({ kind: "error", message: "Your session has ended. Sign in again in a new tab, then save here." });
        window.open("/admin/login", "_blank");
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
    <form ref={formRef} onSubmit={save} noValidate className="grid gap-6">
      {fields.map((f) => (
        <FieldInput key={f.name} field={f} path={f.name} errors={errors} refs={refs} value={values[f.name]} onChange={(v) => set(f.name, v)} />
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
          {status.kind === "saved" && viewHref && (
            <>
              {" "}
              <a href={viewHref} target="_blank" rel="noopener" className="underline underline-offset-4">
                View on site
              </a>
            </>
          )}
        </p>
      </div>
    </form>
  );
}
