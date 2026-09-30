"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
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
        className="border-2 border-forest px-4 py-2 font-bold text-forest md:hidden"
        aria-expanded={open}
        aria-controls="main-menu"
        onClick={() => setOpenOn(open ? null : pathname)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <ul
        id="main-menu"
        className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-full z-20 flex-col border-b-4 border-forest bg-white px-4 pb-4 shadow-lg md:static md:border-0 md:shadow-none md:flex md:flex-row md:gap-1 md:p-0`}
      >
        {links.map(({ href, label }) => {
          const current = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`block border-b border-forest/15 py-3 text-lg font-bold text-forest md:border-b-4 md:px-3 md:py-2 md:text-base ${
                  current ? "md:border-gold" : "md:border-transparent hover:text-olive"
                }`}
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
