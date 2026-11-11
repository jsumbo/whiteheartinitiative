"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Starts a News post as a draft from the dashboard, then opens it to finish (photo, formatting, publish).
export function QuickDraft() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return setError("Add a title and a few words about the post.");
    setSaving(true);
    setError("");
    const body = text
      .trim()
      .split(/\n\s*\n/)
      .map((p) => `<p>${escape(p.trim()).replace(/\n/g, "<br>")}</p>`)
      .join("");
    const res = await fetch("/api/admin/items/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, status: "draft", date: new Date().toISOString().slice(0, 10) }),
    }).catch(() => null);
    const json = await res?.json().catch(() => null);
    if (!res?.ok || !json?.id) {
      setSaving(false);
      return setError(json?.error ?? "Could not save the draft. Please try again.");
    }
    router.push(`/admin/posts/${json.id}`);
  }

  const input = "mt-1 block w-full rounded-lg border-2 border-stone-300 bg-white px-3 py-2.5 text-base font-normal text-ink focus:border-forest focus:outline-none";

  return (
    <form onSubmit={save} className="grid gap-3" noValidate>
      <label className="block font-semibold">
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} maxLength={200} />
      </label>
      <label className="block font-semibold">
        What&apos;s it about?
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className={input} />
      </label>
      {error && (
        <p role="alert" className="text-sm font-bold text-red-800">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className="rounded-lg bg-forest px-4 py-2.5 font-bold text-white hover:bg-olive disabled:opacity-60">
          {saving ? "Saving…" : "Save draft"}
        </button>
        <p className="text-sm text-stone-600">Saved as a draft. You can add photos and publish it next.</p>
      </div>
    </form>
  );
}
