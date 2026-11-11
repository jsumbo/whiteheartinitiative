"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { menu } from "@/lib/admin/menu";
import { AdminIcon } from "./AdminIcon";

type Props = { messageCount: number };

// The admin side menu: a fixed sidebar on large screens and a slide-out drawer on phones and tablets.
export function AdminNav({ messageCount }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  // Set when the drawer is closed with Escape or the close button, so focus goes back to the Menu button.
  const restoreFocus = useRef(false);
  const close = () => {
    restoreFocus.current = true;
    setOpen(false);
  };

  // Close the drawer after following a link.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    // While the drawer is open, the page behind it can't be reached with the keyboard or a screen reader.
    const behind = [document.getElementById("admin-main"), document.getElementById("admin-topbar")];
    behind.forEach((el) => el?.setAttribute("inert", ""));
    const button = menuButton.current;
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      behind.forEach((el) => el?.removeAttribute("inert"));
      // Only now is the Menu button reachable again.
      if (restoreFocus.current) button?.focus();
      restoreFocus.current = false;
    };
  }, [open]);

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const brand = (
    <Link href="/admin" className="flex items-center gap-3">
      <Logo className="h-10 w-auto" />
      <span className="rounded-md bg-gold-light/40 px-2 py-0.5 text-xs font-bold tracking-wider text-forest uppercase">Admin</span>
    </Link>
  );

  return (
    <>
      {/* Top bar on phones and tablets */}
      <div id="admin-topbar" className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-2 lg:hidden">
        {brand}
        <button
          ref={menuButton}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="admin-sidebar"
          className="flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold text-forest hover:bg-stone-50"
        >
          <AdminIcon name="menu" />
          Menu
        </button>
      </div>

      {open && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={close}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
        />
      )}

      <aside
        id="admin-sidebar"
        aria-label="Admin"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-stone-200 bg-white transition-transform duration-200 motion-reduce:transition-none lg:z-20 lg:w-64 lg:translate-x-0 ${
          open ? "translate-x-0 shadow-xl" : "invisible -translate-x-full lg:visible"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
          {brand}
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
          >
            <AdminIcon name="close" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="grid gap-1">
            {menu.map((item, i) => {
              const current = item.match(pathname);
              const count = item.badge === "messages" ? messageCount : 0;
              return (
                <li key={item.href}>
                  <Link
                    ref={i === 0 ? firstLink : undefined}
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold ${
                      current ? "bg-forest text-white shadow-sm" : "text-stone-700 hover:bg-stone-100 hover:text-forest"
                    }`}
                  >
                    <AdminIcon name={item.icon} className={`size-5 ${current ? "" : "text-stone-500"}`} />
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${current ? "bg-white text-forest" : "bg-gold-light/50 text-forest"}`}>
                        {count}
                        <span className="sr-only"> {count === 1 ? "message" : "messages"}</span>
                      </span>
                    )}
                    {current && <AdminIcon name="chevron" className="size-4 -rotate-90" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="grid gap-1 border-t border-stone-200 px-3 py-3">
          <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-stone-700 hover:bg-stone-100 hover:text-forest">
            <AdminIcon name="external" className="size-5 text-stone-500" />
            View website<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <button type="button" onClick={signOut} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left font-semibold text-stone-700 hover:bg-stone-100 hover:text-forest">
            <AdminIcon name="signout" className="size-5 text-stone-500" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
