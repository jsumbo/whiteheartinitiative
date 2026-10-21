"use client";

import dynamic from "next/dynamic";
import { useId, useRef, useState } from "react";
import type { RefOption, Refs } from "@/lib/admin/refs";
import type { Field } from "@/lib/admin/schema";
import { moveItem, useSortable } from "./sortable";

export type Values = Record<string, unknown>;

// The rich text editor is only downloaded on pages that have one (news posts).
const RichTextEditor = dynamic(() => import("./RichTextEditor").then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => <div className="mt-1 min-h-[20rem] border-2 border-stone-300 bg-white p-4 text-stone-500">Loading editor...</div>,
});

const input =
  "mt-1 block w-full border-2 border-stone-300 bg-white px-3 py-2.5 text-base text-ink focus:border-forest focus:outline-none aria-invalid:border-red-700";
export const smallBtn =
  "border-2 border-stone-300 bg-white px-3 py-1.5 text-sm font-bold text-forest hover:border-forest disabled:opacity-40";
const handleCls = "hidden cursor-grab touch-none px-1 text-xl leading-none text-stone-400 select-none hover:text-forest sm:block";
const dropCls = "data-drop-target:outline-2 data-drop-target:outline-dashed data-drop-target:outline-forest";

const isRequired = (f: Field) => "required" in f && Boolean(f.required);

// Lists every required field that is empty, as "name", "group.name" or "list.0.name" paths.
export function missingFields(fields: Field[], values: Values, prefix = ""): { path: string; label: string }[] {
  return fields.flatMap((f) => {
    const path = prefix + f.name;
    const v = values?.[f.name];
    if (f.type === "group") return missingFields(f.fields, (v as Values) ?? {}, `${path}.`);
    if (f.type === "groupList")
      return (Array.isArray(v) ? (v as Values[]) : []).flatMap((g, i) => missingFields(f.fields, g, `${path}.${i}.`));
    return isRequired(f) && !String(v ?? "").trim() ? [{ path, label: f.label }] : [];
  });
}

type Common = { path: string; errors: Set<string>; refs: Refs };

function Label({ id, field }: { id: string; field: Field }) {
  return (
    <label htmlFor={id} className="block text-base font-bold text-ink">
      {field.label}
      {isRequired(field) && <span className="font-normal text-stone-500"> (required)</span>}
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

function Missing({ id, show }: { id: string; show: boolean }) {
  return show ? (
    <p id={id} className="mt-1 text-sm font-bold text-red-800">
      Please fill this in.
    </p>
  ) : null;
}

export function FieldInput({
  field,
  value,
  onChange,
  path,
  errors,
  refs,
}: Common & { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const invalid = errors.has(path);
  const describedBy = [field.hint && hintId, invalid && errorId].filter(Boolean).join(" ") || undefined;
  const control = { id, "data-path": path, "aria-describedby": describedBy, "aria-invalid": invalid || undefined, className: input };

  const wrap = (el: React.ReactNode) => (
    <div>
      <Label id={id} field={field} />
      <Hint id={hintId} text={field.hint} />
      {el}
      <Missing id={errorId} show={invalid} />
    </div>
  );

  switch (field.type) {
    case "textarea":
      return wrap(
        <textarea
          {...control}
          rows={Math.min(12, Math.max(3, Math.ceil(String(value ?? "").length / 70)))}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />,
      );
    case "richtext":
      return (
        <div>
          <p id={`${id}-label`} className="block text-base font-bold text-ink">
            {field.label}
            {isRequired(field) && <span className="font-normal text-stone-500"> (required)</span>}
          </p>
          <Hint id={hintId} text={field.hint} />
          <RichTextEditor
            id={id}
            labelId={`${id}-label`}
            path={path}
            value={String(value ?? "")}
            onChange={onChange}
            describedBy={describedBy}
            invalid={invalid}
          />
          <Missing id={errorId} show={invalid} />
        </div>
      );
    case "image":
      return <ImageInput id={id} field={field} path={path} invalid={invalid} value={String(value ?? "")} onChange={onChange} />;
    case "list":
      return <ListInput field={field} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
    case "select":
      return wrap(
        <select {...control} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          <option value="">{field.required ? "Choose one" : "None"}</option>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>,
      );
    case "ref":
      return wrap(<RefSelect control={control} options={refs[field.collection] ?? []} emptyLabel={field.emptyLabel} value={value} onChange={onChange} />);
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
                path={`${path}.${f.name}`}
                errors={errors}
                refs={refs}
                value={((value as Values) ?? {})[f.name]}
                onChange={(v) => onChange({ ...((value as Values) ?? {}), [f.name]: v })}
              />
            ))}
          </div>
        </fieldset>
      );
    case "groupList":
      return (
        <GroupListInput
          field={field}
          path={path}
          errors={errors}
          refs={refs}
          value={Array.isArray(value) ? (value as Values[]) : []}
          onChange={onChange}
        />
      );
    default:
      return wrap(<input {...control} type={field.type} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />);
  }
}

function RefSelect({
  control,
  options,
  emptyLabel,
  value,
  onChange,
}: {
  control: React.SelectHTMLAttributes<HTMLSelectElement>;
  options: RefOption[];
  emptyLabel: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const current = String(value ?? "");
  return (
    <select {...control} value={current} onChange={(e) => onChange(e.target.value)}>
      <option value="">{emptyLabel}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.title}
        </option>
      ))}
      {current && !options.some((o) => o.id === current) && <option value={current}>(deleted entry)</option>}
    </select>
  );
}

// Uploads one photo and returns its URL. Shared with the bulk photo upload.
export async function uploadPhoto(file: File): Promise<string> {
  if (/\.hei[cf]$/i.test(file.name) || /hei[cf]/i.test(file.type))
    throw new Error("HEIC photos cannot be used. Save the photo as JPG first, or upload it from your phone's browser.");
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error("Your session has ended. Please sign in again.");
  if (!res.ok) throw new Error(data.error || "The photo could not be uploaded.");
  return data.url;
}

function ImageInput({
  id,
  field,
  path,
  invalid,
  value,
  onChange,
}: {
  id: string;
  field: Field;
  path: string;
  invalid: boolean;
  value: string;
  onChange: (v: unknown) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      onChange(await uploadPhoto(file));
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
        <div
          className={`flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-stone-100 sm:w-56 ${invalid ? "border-2 border-red-700" : ""}`}
        >
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
          <button type="button" data-path={path} className={smallBtn} disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? "Uploading..." : value ? "Replace photo" : "Upload photo"}
          </button>
          {value && !busy && (
            <button type="button" className={smallBtn} onClick={() => onChange("")}>
              Remove
            </button>
          )}
        </div>
      </div>
      <Missing id={`${id}-error`} show={invalid && !value} />
      {error && (
        <p role="alert" className="mt-2 text-sm font-bold text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

function MoveButtons({ i, count, label, onMove }: { i: number; count: number; label: string; onMove: (from: number, to: number) => void }) {
  return (
    <>
      <button type="button" className={smallBtn} disabled={i === 0} onClick={() => onMove(i, i - 1)} aria-label={`Move ${label} up`}>
        ↑
      </button>
      <button type="button" className={smallBtn} disabled={i === count - 1} onClick={() => onMove(i, i + 1)} aria-label={`Move ${label} down`}>
        ↓
      </button>
    </>
  );
}

function ListInput({ field, value, onChange }: { field: Extract<Field, { type: "list" }>; value: string[]; onChange: (v: unknown) => void }) {
  const id = useId();
  const reorder = (from: number, to: number) => onChange(moveItem(value, from, to));
  const sort = useSortable(reorder);
  const name = field.itemLabel.toLowerCase();
  return (
    <fieldset>
      <legend className="text-base font-bold">{field.label}</legend>
      <Hint id={`${id}-hint`} text={field.hint} />
      <ol className="mt-2 grid gap-2">
        {value.map((item, i) => (
          <li key={i} {...sort.item(i)} className={`flex flex-col gap-2 bg-white sm:flex-row sm:items-center ${dropCls}`}>
            <span {...sort.handle(i)} aria-hidden="true" title="Drag to move" className={handleCls}>
              ⠿
            </span>
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
              <MoveButtons i={i} count={value.length} label={`${name} ${i + 1}`} onMove={reorder} />
              <button type="button" className={smallBtn} onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${name} ${i + 1}`}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className={`${smallBtn} mt-2`} onClick={() => onChange([...value, ""])}>
        + Add {name}
      </button>
    </fieldset>
  );
}

function GroupListInput({
  field,
  value,
  onChange,
  path,
  errors,
  refs,
}: Common & { field: Extract<Field, { type: "groupList" }>; value: Values[]; onChange: (v: unknown) => void }) {
  const id = useId();
  const reorder = (from: number, to: number) => onChange(moveItem(value, from, to));
  const sort = useSortable(reorder);
  const name = field.itemLabel.toLowerCase();
  // The first text field names each group in its heading, e.g. "Number 2: Children reached".
  const titleOf = (g: Values) => String(g.title ?? g.name ?? g.label ?? g.item ?? "");
  return (
    <fieldset>
      <legend className="text-base font-bold">{field.label}</legend>
      <Hint id={`${id}-hint`} text={field.hint} />
      <ol className="mt-3 grid gap-4">
        {value.map((group, i) => (
          <li key={i} {...sort.item(i)} className={`border-2 border-stone-200 bg-stone-50 p-4 ${dropCls}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-bold text-forest">
                <span {...sort.handle(i)} aria-hidden="true" title="Drag to move" className={handleCls}>
                  ⠿
                </span>
                {field.itemLabel} {i + 1}
                {titleOf(group) ? `: ${titleOf(group)}` : ""}
              </p>
              <div className="flex gap-1">
                <MoveButtons i={i} count={value.length} label={`${name} ${i + 1}`} onMove={reorder} />
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() => confirm(`Remove "${titleOf(group) || `${field.itemLabel} ${i + 1}`}"?`) && onChange(value.filter((_, j) => j !== i))}
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
                  path={`${path}.${i}.${f.name}`}
                  errors={errors}
                  refs={refs}
                  value={group[f.name]}
                  onChange={(v) => onChange(value.map((g, j) => (j === i ? { ...g, [f.name]: v } : g)))}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className={`${smallBtn} mt-3`} onClick={() => onChange([...value, {}])}>
        + Add {name}
      </button>
    </fieldset>
  );
}
