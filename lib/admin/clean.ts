import "server-only";
import { richTextToPlain, sanitizeRichText } from "@/lib/sanitize";
import type { Field } from "./schema";

// Server-only, so the HTML sanitizer never ships to the browser.
// Keeps only known fields, trims text and checks required ones. Returns an error message if something is missing.
export function clean(fields: Field[], input: unknown): { data: Record<string, unknown>; error?: string } {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const f of fields) {
    const v = src[f.name];
    switch (f.type) {
      case "list":
        data[f.name] = Array.isArray(v) ? v.map((x) => String(x ?? "").trim().slice(0, 1000)).filter(Boolean) : [];
        break;
      case "group":
        data[f.name] = clean(f.fields, v).data;
        break;
      case "groupList":
        data[f.name] = Array.isArray(v) ? v.map((x) => clean(f.fields, x).data) : [];
        break;
      default: {
        const s = typeof v === "string" ? v.trim().slice(0, 10000) : "";
        if (f.type === "url" && s && !/^https?:\/\//i.test(s)) return { data, error: `${f.label}: the link must start with https://` };
        if (f.type === "date" && s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) return { data, error: `${f.label}: use the date picker.` };
        if (f.type === "image" && s && !/^(https:\/\/|\/uploads\/)/.test(s)) return { data, error: `${f.label}: please upload the photo again.` };
        if (f.type === "select" && s && !f.options.some((o) => o.value === s)) return { data, error: `${f.label}: pick one of the options.` };
        if (f.type === "richtext") {
          const html = sanitizeRichText(typeof v === "string" ? v.slice(0, 200000) : "");
          data[f.name] = richTextToPlain(html) || /<img/.test(html) ? html : "";
          if (f.required && !data[f.name]) return { data, error: `Please fill in "${f.label}".` };
          continue;
        }
        data[f.name] = s;
      }
    }
    if ("required" in f && f.required && !data[f.name]) return { data, error: `Please fill in "${f.label}".` };
  }
  return { data };
}
