"use client";

import { useId, useRef, useState } from "react";
import type { Field } from "@/lib/admin/schema";

export type Values = Record<string, unknown>;
export type ProgramOption = { id: string; title: string };

const input =
  "mt-1 block w-full border-2 border-stone-300 bg-white px-3 py-2.5 text-base text-ink focus:border-forest focus:outline-none";
const smallBtn =
  "border-2 border-stone-300 bg-white px-3 py-1.5 text-sm font-bold text-forest hover:border-forest disabled:opacity-40";

function Label({ id, field }: { id: string; field: Field }) {
  return (
    <label htmlFor={id} className="block text-base font-bold text-ink">
      {field.label}
      {"required" in field && field.required && <span className="font-normal text-stone-500"> (required)</span>}
    </label>
  );
}

function Hint({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={id} className="mt-1 text-sm text-stone-600">
      {text}
    </p>
  ) : null;
}

export function FieldInput({
  field,
  value,
  onChange,
  programs,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  programs: ProgramOption[];
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const describedBy = field.hint ? hintId : undefined;

  switch (field.type) {
    case "textarea":
      return (
        <div>
          <Label id={id} field={field} />
          <Hint id={hintId} text={field.hint} />
          <textarea
            id={id}
            aria-describedby={describedBy}
            required={field.required}
            rows={Math.min(12, Math.max(3, Math.ceil(String(value ?? "").length / 70)))}
            className={input}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "image":
      return <ImageInput id={id} field={field} value={String(value ?? "")} onChange={onChange} />;
    case "list":
      return <ListInput field={field} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
    case "program":
      return (
        <div>
          <Label id={id} field={field} />
          <Hint id={hintId} text={field.hint} />
          <select id={id} aria-describedby={describedBy} className={input} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            <option value="">No program</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      );
    case "group":
      return (
        <fieldset className="border-2 border-stone-200 p-4">
          <legend className="px-1 text-base font-bold">{field.label}</legend>
          <Hint id={hintId} text={field.hint} />
          <div className="mt-3 grid gap-4">
            {field.fields.map((f) => (
              <FieldInput
                key={f.name}
                field={f}
                programs={programs}
                value={((value as Values) ?? {})[f.name]}
                onChange={(v) => onChange({ ...((value as Values) ?? {}), [f.name]: v })}
              />
            ))}
          </div>
        </fieldset>
      );
    case "groupList":
      return <GroupListInput field={field} value={Array.isArray(value) ? (value as Values[]) : []} onChange={onChange} programs={programs} />;
    default:
      return (
        <div>
          <Label id={id} field={field} />
          <Hint id={hintId} text={field.hint} />
          <input
            id={id}
            type={field.type}
            aria-describedby={describedBy}
            required={field.required}
            className={input}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}

function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function ImageInput({ id, field, value, onChange }: { id: string; field: Field; value: string; onChange: (v: unknown) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "The photo could not be uploaded.");
      onChange(data.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <Label id={id} field={field} />
      <Hint id={`${id}-hint`} text={field.hint} />
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-stone-100 sm:w-56">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-stone-500">No photo yet</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <button type="button" className={smallBtn} disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? "Uploading..." : value ? "Replace photo" : "Upload photo"}
          </button>
          {value && !busy && (
            <button type="button" className={smallBtn} onClick={() => onChange("")}>
              Remove
            </button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-bold text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

function ListInput({ field, value, onChange }: { field: Extract<Field, { type: "list" }>; value: string[]; onChange: (v: unknown) => void }) {
  const id = useId();
  return (
    <fieldset>
      <legend className="text-base font-bold">{field.label}</legend>
      <Hint id={`${id}-hint`} text={field.hint} />
      <ol className="mt-2 grid gap-2">
        {value.map((item, i) => (
          <li key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor={`${id}-${i}`}>
              {field.itemLabel} {i + 1}
            </label>
            <input
              id={`${id}-${i}`}
              className={`${input} mt-0 flex-1`}
              value={item}
              onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
            />
            <div className="flex gap-1">
              <button type="button" className={smallBtn} disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))} aria-label={`Move ${field.itemLabel.toLowerCase()} ${i + 1} up`}>
                ↑
              </button>
              <button type="button" className={smallBtn} disabled={i === value.length - 1} onClick={() => onChange(move(value, i, i + 1))} aria-label={`Move ${field.itemLabel.toLowerCase()} ${i + 1} down`}>
                ↓
              </button>
              <button type="button" className={smallBtn} onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${field.itemLabel.toLowerCase()} ${i + 1}`}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className={`${smallBtn} mt-2`} onClick={() => onChange([...value, ""])}>
        + Add {field.itemLabel.toLowerCase()}
      </button>
    </fieldset>
  );
}

function GroupListInput({
  field,
  value,
  onChange,
  programs,
}: {
  field: Extract<Field, { type: "groupList" }>;
  value: Values[];
  onChange: (v: unknown) => void;
  programs: ProgramOption[];
}) {
  const id = useId();
  return (
    <fieldset>
      <legend className="text-base font-bold">{field.label}</legend>
      <Hint id={`${id}-hint`} text={field.hint} />
      <ol className="mt-3 grid gap-4">
        {value.map((group, i) => (
          <li key={i} className="border-2 border-stone-200 bg-stone-50 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-forest">
                {field.itemLabel} {i + 1}
                {group.title ? `: ${group.title}` : ""}
              </p>
              <div className="flex gap-1">
                <button type="button" className={smallBtn} disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))} aria-label={`Move ${field.itemLabel.toLowerCase()} ${i + 1} up`}>
                  ↑
                </button>
                <button type="button" className={smallBtn} disabled={i === value.length - 1} onClick={() => onChange(move(value, i, i + 1))} aria-label={`Move ${field.itemLabel.toLowerCase()} ${i + 1} down`}>
                  ↓
                </button>
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() => confirm(`Remove "${group.title || `${field.itemLabel} ${i + 1}`}"?`) && onChange(value.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="grid gap-4">
              {field.fields.map((f) => (
                <FieldInput
                  key={f.name}
                  field={f}
                  programs={programs}
                  value={group[f.name]}
                  onChange={(v) => onChange(value.map((g, j) => (j === i ? { ...g, [f.name]: v } : g)))}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className={`${smallBtn} mt-3`} onClick={() => onChange([...value, {}])}>
        + Add {field.itemLabel.toLowerCase()}
      </button>
    </fieldset>
  );
}
