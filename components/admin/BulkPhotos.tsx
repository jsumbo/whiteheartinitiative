"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { RefOption } from "@/lib/admin/refs";
import { smallBtn, uploadPhoto } from "./fields";

type Photo = { key: string; name: string; preview: string; url?: string; alt: string; error?: string; added?: boolean };

const input = "mt-1 block w-full border-2 border-stone-300 bg-white px-3 py-2.5 text-base focus:border-forest focus:outline-none";

// Upload many gallery photos at once: pick them, set the date and project once, describe each photo, add.
export function BulkPhotos({ projects }: { projects: RefOption[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [project, setProject] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showMissing, setShowMissing] = useState(false);

  const update = (key: string, patch: Partial<Photo>) => setPhotos((list) => list.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  async function pick(files: FileList) {
    const added = [...files].map((file) => ({ file, photo: { key: crypto.randomUUID(), name: file.name, preview: URL.createObjectURL(file), alt: "" } }));
    setPhotos((list) => [...list, ...added.map((a) => a.photo)]);
    if (fileRef.current) fileRef.current.value = "";
    // Three at a time, so a slow connection still makes steady progress.
    const queue = [...added];
    const worker = async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        try {
          update(next.photo.key, { url: await uploadPhoto(next.file), error: undefined });
        } catch (e) {
          update(next.photo.key, { error: (e as Error).message });
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
  }

  async function addAll() {
    const ready = photos.filter((p) => p.url && !p.added);
    const missing = ready.filter((p) => !p.alt.trim());
    if (!date) return setMessage("Please pick the date the photos were taken.");
    if (missing.length) {
      setShowMissing(true);
      setMessage(`Please describe ${missing.length === 1 ? "1 photo" : `${missing.length} photos`} (marked in red).`);
      document.getElementById(`alt-${missing[0].key}`)?.focus();
      return;
    }
    setBusy(true);
    setMessage("");
    let failed = 0;
    for (const p of ready) {
      const res = await fetch("/api/admin/items/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: p.url, alt: p.alt, project, date }),
      }).catch(() => null);
      if (res?.ok) update(p.key, { added: true });
      else failed++;
    }
    setBusy(false);
    if (failed) return setMessage(`${failed} could not be added. Please try again.`);
    router.push("/admin/gallery");
    router.refresh();
  }

  const uploading = photos.some((p) => !p.url && !p.error);
  const ready = photos.filter((p) => p.url && !p.added).length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-bold">Date taken (required)</span>
          <span className="block text-sm text-stone-600">Used for every photo below.</span>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={input} />
        </label>
        <label className="block">
          <span className="font-bold">Project</span>
          <span className="block text-sm text-stone-600">Optional. Used for every photo below.</span>
          <select value={project} onChange={(e) => setProject(e.target.value)} className={input}>
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          id="bulk-files"
          onChange={(e) => e.target.files?.length && pick(e.target.files)}
        />
        <button type="button" className="bg-forest px-5 py-3 font-bold text-white hover:bg-olive" onClick={() => fileRef.current?.click()}>
          {photos.length ? "Pick more photos" : "Pick photos"}
        </button>
      </div>

      {photos.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {photos.map((p) => {
            const missing = showMissing && p.url && !p.added && !p.alt.trim();
            return (
              <li key={p.key} className="border-2 border-stone-200 bg-white p-3">
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt="" className={`h-full w-full object-cover ${p.url ? "" : "opacity-50"}`} />
                  <span className="absolute top-2 left-2 bg-white px-2 py-0.5 text-xs font-bold">
                    {p.added ? "Added" : p.error ? "Failed" : p.url ? "Uploaded" : "Uploading..."}
                  </span>
                </div>
                {p.error ? (
                  <p role="alert" className="mt-2 text-sm font-bold text-red-800">
                    {p.name}: {p.error}
                  </p>
                ) : (
                  <label className="mt-2 block">
                    <span className="text-sm font-bold">Photo description (required)</span>
                    <input
                      id={`alt-${p.key}`}
                      value={p.alt}
                      disabled={p.added}
                      aria-invalid={missing || undefined}
                      onChange={(e) => update(p.key, { alt: e.target.value })}
                      placeholder="What is in the photo?"
                      className={`${input} aria-invalid:border-red-700`}
                    />
                  </label>
                )}
                {!p.added && (
                  <button type="button" className={`${smallBtn} mt-2`} onClick={() => setPhotos((list) => list.filter((x) => x.key !== p.key))}>
                    Remove<span className="sr-only"> {p.name}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {photos.length > 0 && (
        <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t-2 border-stone-200 bg-white py-3">
          <button type="button" disabled={busy || uploading || !ready} onClick={addAll} className="bg-forest px-6 py-3 font-bold text-white hover:bg-olive disabled:opacity-60">
            {busy ? "Adding..." : uploading ? "Uploading..." : `Add ${ready} ${ready === 1 ? "photo" : "photos"} to the gallery`}
          </button>
          <p role="status" aria-live="polite" className="font-bold text-red-800">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
