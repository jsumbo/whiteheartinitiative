"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/news", label: "News" },
  { href: "/media", label: "Media" },
  { href: "/support", label: "Support Us", cta: true },
];

export function MainNav() {
  const pathname = usePathname();
  // The menu is tied to the page it was opened on, so it closes itself after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <nav aria-label="Main">
      <button
        type="button"
        className="border-2 border-forest px-4 py-2 font-bold text-forest lg:hidden"
        aria-expanded={open}
        aria-controls="main-menu"
        onClick={() => setOpenOn(open ? null : pathname)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <ul
        id="main-menu"
        className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-full z-20 flex-col border-b-4 border-forest bg-white px-4 pb-4 shadow-lg lg:static lg:border-0 lg:shadow-none lg:flex lg:flex-row lg:gap-1 lg:p-0`}
      >
        {links.map(({ href, label, cta }) => {
          const current = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className={cta ? "mt-3 lg:mt-0 lg:ml-2" : ""}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={
                  cta
                    ? `block bg-gold px-4 py-3 text-center text-lg font-bold text-ink hover:bg-gold-light lg:py-2 lg:text-base ${current ? "outline-2 outline-offset-2 outline-forest" : ""}`
                    : `block border-b border-forest/15 py-3 text-lg font-bold text-forest lg:border-b-4 lg:px-3 lg:py-2 lg:text-base ${
                        current ? "lg:border-gold" : "lg:border-transparent hover:text-olive"
                      }`
                }
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
