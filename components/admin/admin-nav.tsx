"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";
import { cx } from "@/lib/utils";
import { logoutAction } from "@/app/admin/actions";

export interface AdminNavItem {
  href: string;
  label: string;
}

/**
 * Mobile admin navigation: a slim top bar (LG:hidden) that opens a slide-in
 * drawer from the LEFT side — never a centred/full-width stack. Desktop uses
 * the static left column rendered by the server layout.
 */
export function AdminMobileNav({ items }: { items: AdminNavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const active = (href: string) => pathname === href;

  return (
    <>
      {/* slim top bar (mobile/tablet only) */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white px-4 py-2.5 shadow-sm lg:hidden">
        <div className="flex items-center gap-2">
          <button
            aria-label="Open admin menu"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <span className="text-sm font-extrabold uppercase tracking-widest text-emerald">Admin Panel</span>
        </div>
      </div>

      {/* left slide-in drawer */}
      {open && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <div className="absolute inset-0 bg-emerald-2/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[78%] max-w-xs flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
              <span className="font-extrabold uppercase tracking-widest text-ink">Admin Panel</span>
              <button
                aria-label="Close admin menu"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3">
              {items.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={cx(
                    "rounded-xl px-4 py-3 text-sm font-semibold transition",
                    active(n.href) ? "bg-emerald text-white" : "text-ink-soft hover:bg-cream2 hover:text-emerald",
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-line p-3">
              <form action={logoutAction}>
                <button className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50">
                  Sign out
                </button>
              </form>
              <Link href="/" className="mt-1 block rounded-xl px-4 py-3 text-sm font-semibold text-emerald hover:bg-cream2">
                ← Back to site
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
