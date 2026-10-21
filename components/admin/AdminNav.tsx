"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { inboxes } from "@/lib/admin/inbox";
import { collections, docs } from "@/lib/admin/schema";

// Built from the schema, so new pages and lists show up here without editing this file.
const sections = [
  { heading: "Pages", links: docs.filter((d) => d.key !== "settings").map((d) => ({ href: `/admin/pages/${d.key}`, label: d.label })) },
  { heading: "Lists", links: collections.map((c) => ({ href: `/admin/${c.name}`, label: c.label })) },
  { heading: "Inbox", links: inboxes.map((b) => ({ href: `/admin/inbox/${b.name}`, label: b.label })) },
  { heading: "Settings", links: docs.filter((d) => d.key === "settings").map((d) => ({ href: `/admin/pages/${d.key}`, label: d.label })) },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="overflow-x-auto border-t border-white/15 lg:flex-1 lg:overflow-y-auto">
      <div className="flex gap-1 px-2 py-2 lg:block lg:px-3 lg:py-4">
        {sections.map((s) => (
          <div key={s.heading} className="contents lg:mb-5 lg:block">
            <p className="hidden px-2 pb-1 text-xs font-bold tracking-[0.15em] text-white/60 uppercase lg:block">{s.heading}</p>
            <ul className="contents lg:block">
              {s.links.map((l) => {
                const current = pathname === l.href || pathname.startsWith(l.href + "/");
                return (
                  <li key={l.href} className="shrink-0">
                    <Link
                      href={l.href}
                      aria-current={current ? "page" : undefined}
                      className={`block px-3 py-2 text-sm font-bold whitespace-nowrap lg:whitespace-normal ${current ? "bg-white text-forest" : "hover:bg-white/10"}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
