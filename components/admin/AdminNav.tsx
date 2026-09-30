"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { heading: "Pages", links: [
    { href: "/admin/pages/home", label: "Home page" },
    { href: "/admin/pages/about", label: "About page" },
    { href: "/admin/pages/programsPage", label: "Programs intro" },
    { href: "/admin/pages/galleryPage", label: "Gallery intro" },
    { href: "/admin/pages/contact", label: "Contact page" },
  ] },
  { heading: "Lists", links: [
    { href: "/admin/programs", label: "Programs" },
    { href: "/admin/team", label: "Team" },
    { href: "/admin/gallery", label: "Gallery" },
  ] },
  { heading: "Settings", links: [{ href: "/admin/pages/settings", label: "Contact details and social links" }] },
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
