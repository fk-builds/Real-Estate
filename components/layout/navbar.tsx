"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";
import { cx } from "@/lib/utils";
import { MenuIcon, CloseIcon, HeartIcon, PhoneIcon, UserIcon } from "@/components/ui/icons";
import { useCollection } from "@/lib/client/collections";

const links = [
  { href: "/", label: "Home", match: "/" },
  { href: "/properties", label: "Buy", match: "/properties" },
  { href: "/rent", label: "Rent", match: "/rent" },
  { href: "/projects", label: "New Developments", match: "/projects" },
  { href: "/locations", label: "Locations", match: "/locations" },
  { href: "/agents", label: "Agents", match: "/agents" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const saved = useCollection("saved");

  const isActive = (m: string) =>
    m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(m + "/");

  return (
    <>
      {/* top utility bar */}
      <div className="bg-emerald-2 text-[0.76rem] text-[#dbe7e0]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-1.5">
          <span>Serving Islamabad · Lahore · Karachi · Rawalpindi · Peshawar</span>
          <div className="flex items-center gap-3">
            <a href="tel:+923000000000" className="flex items-center gap-1.5 font-semibold text-[#e9d6a8] hover:underline">
              <PhoneIcon className="h-3.5 w-3.5" /> +92 300 000 0000
            </a>
            <span className="hidden text-white/30 sm:inline">|</span>
            <a href="/sell" className="hidden font-semibold text-[#e9d6a8] hover:underline sm:inline">
              List your property
            </a>
          </div>
        </div>
      </div>

      {/* main nav */}
      <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-3.5">
          <Logo />

          <div className="hidden items-center gap-5 xl:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cx(
                  "relative py-1 text-[0.93rem] font-semibold transition-colors hover:text-emerald",
                  isActive(l.match) ? "text-emerald" : "text-ink-soft",
                )}
              >
                {l.label}
                {isActive(l.match) && (
                  <span className="absolute -bottom-[9px] left-0 right-0 h-[2px] rounded bg-gold" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="hidden rounded-full border-[1.5px] border-emerald/30 px-4 py-2 text-[0.85rem] font-bold text-emerald transition hover:bg-emerald/5 md:inline-flex"
            >
              Sell with us
            </Link>
            <Link
              href="/sell"
              className="hidden rounded-full bg-emerald px-5 py-2 text-[0.85rem] font-bold text-white shadow-md transition hover:-translate-y-px hover:bg-emerald-3 sm:inline-flex"
            >
              List Property
            </Link>
            <Link
              href="/account"
              aria-label="My account"
              className="hidden h-10 w-10 place-items-center rounded-xl border-[1.5px] border-line bg-white text-ink-soft transition hover:border-emerald hover:text-emerald md:grid"
            >
              <UserIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/saved"
              aria-label={`Saved properties (${saved.items.length})`}
              className="relative hidden h-10 w-10 place-items-center rounded-xl border-[1.5px] border-line bg-white text-ink-soft transition hover:border-emerald hover:text-emerald lg:grid"
            >
              <HeartIcon className="h-5 w-5" />
              {saved.items.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-[18px] w-[18px] place-items-center rounded-full border-2 border-white bg-gold-deep text-[0.62rem] font-extrabold text-white">
                  {saved.items.length}
                </span>
              )}
            </Link>
            <button
              aria-label="Open menu"

              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-line xl:hidden"
            >
              <MenuIcon className="h-6 w-6 text-ink" />
            </button>
          </div>
        </nav>
      </header>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[100] flex xl:hidden">
          <div className="absolute inset-0 bg-emerald-2/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative ml-auto flex h-full w-[84%] max-w-sm flex-col bg-cream px-8 py-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-line"
              >
                <CloseIcon className="h-6 w-6 text-ink" />
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cx(
                    "border-b border-line py-4 font-serif text-xl font-semibold",
                    isActive(l.match) ? "text-emerald" : "text-ink",
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/sell" onClick={() => setOpen(false)} className="btn btn-emerald mt-8 w-full">
                List Property
              </Link>
              <Link href="/account" onClick={() => setOpen(false)} className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-line py-3 font-semibold text-emerald">
                <UserIcon className="h-5 w-5" /> My account
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
