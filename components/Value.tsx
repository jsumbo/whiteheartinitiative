import { isPlaceholder } from "@/lib/content";

// Shows a contact or payment detail, or a clearly marked placeholder until it is filled in through the admin.
export function Value({ value, label, href }: { value?: string; label: string; href?: string }) {
  if (isPlaceholder(value)) return <span className="placeholder">[PLACEHOLDER: add {label.toLowerCase()} in the admin]</span>;
  if (href) return <a href={href} className="underline decoration-gold decoration-2 underline-offset-4">{value}</a>;
  return <>{value}</>;
}

export const telHref = (phone?: string) => `tel:${(phone ?? "").replace(/[^+\d]/g, "")}`;
