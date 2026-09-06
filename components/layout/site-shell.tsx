"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";
import { cx } from "@/lib/utils";
import {
  MenuIcon, CloseIcon, HeartIcon, PhoneIcon, UserIcon, GridIcon, ShieldIcon, HomeIcon,
} from "@/components/ui/icons";
import { useCollection } from "@/lib/client/collections";

const MAIN = [
  { href: "/", label: "Home", match: "/", icon: HomeIcon },
  { href: "/properties", label: "Buy", match: "/properties", icon: null },
  { href: "/rent", label: "Rent", match: "/rent", icon: null },
  { href: "/projects", label: "New Developments", match: "/projects", icon: null },
  { href: "/locations", label: "Locations", match: "/locations", icon: null },
  { href: "/agents", label: "Agents", match: "/agents", icon: null },
];

function GroupLabel({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className={cx(
        "px-3 pt-1 text-[0.62rem] font-extrabold uppercase tracking-[0.22em]",
        dark ? "text-gold-2/60" : "text-mut",
      )}
    >
      {children}
    </div>
  );
}

function NavRow({
  href,
  label,
  icon: Icon,
  active,
  onClick,
  dark,
}: {
  href: string;
  label: string;
  icon?: (typeof GridIcon) | null;
  active: boolean;
  onClick?: () => void;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cx(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.92rem] font-semibold transition-all duration-300",
        !active && "hover:translate-x-0.5",
        active
          ? dark
            ? "bg-white/10 text-gold-2 ring-1 ring-white/10"
            : "bg-brand/5 text-brand ring-1 ring-gold/30"
          : dark
            ? "text-white/75 hover:bg-white/5 hover:text-white"
            : "text-ink-soft hover:bg-cream2 hover:text-brand",
      )}
    >
      {Icon && (
        <span className={cx("grid h-8 w-8 flex-none place-items-center rounded-lg transition", dark ? "text-gold-2/80" : "text-gold-deep")}>
          <Icon className="h-4 w-4" />
        </span>
      )}
      {active && (
        <span className={cx("absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full", dark ? "bg-gold-2" : "bg-gold-deep")} />
      )}
      <span className={cx(Icon ? "flex-1" : "flex-1 pl-1")}>{label}</span>
    </Link>
  );
}

function AdminEntry({ onNavigate, dark }: { onNavigate?: () => void; dark?: boolean }) {
  return (
    <Link
      href="/admin"
      onClick={onNavigate}
      className={cx(
        "flex items-center justify-center gap-2.5 rounded-full px-3 py-2.5 text-[0.9rem] font-bold transition-all duration-300",
        dark ? "btn-gold" : "btn-gold",
        "w-full",
      )}
    >
      <ShieldIcon className="h-4 w-4" /> Admin Panel
    </Link>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const saved = useCollection("saved");
  const active = (m: string) =>
    m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(m + "/");

  const close = () => setOpen(false);

  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* ---------------- Desktop fixed LEFT luxury rail ---------------- */}
      <aside className="sticky top-0 z-40 hidden h-screen w-72 shrink-0 flex-col overflow-hidden bg-brand-2 text-white lg:flex">
        {/* faint media wash */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(120%_80%_at_100%_0%,#b68d45,transparent_55%)]" />
        <div className="relative px-6 pb-6 pt-7">
          <Logo light />
        </div>
        <div className="relative h-px bg-white/10" />

        <div className="relative mt-4 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
          <div>
            <GroupLabel dark>Browse</GroupLabel>
            <div className="mt-2 space-y-1">
              {MAIN.map((l) => (
                <NavRow key={l.href} href={l.href} label={l.label} icon={l.icon} active={active(l.match)} dark />
              ))}
            </div>
          </div>

          <div className="my-4 h-px bg-white/10" />
          <div>
            <GroupLabel dark>My account</GroupLabel>
            <div className="mt-2 space-y-1">
              <NavRow href="/account" label="My account" icon={UserIcon} active={active("/account")} dark />
              <NavRow href="/saved" label="Saved" icon={HeartIcon} active={active("/saved")} dark />
              <NavRow href="/sell" label="List property" icon={GridIcon} active={active("/sell")} dark />
            </div>
          </div>
        </div>

        <div className="relative space-y-3 px-5 pb-6 pt-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <a href="tel:+923000000000" className="flex items-center gap-3 text-white/90">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/20 text-gold-2">
                <PhoneIcon className="h-4 w-4" />
              </span>
              <span className="leading-tight">
                <span className="block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gold-2/70">Talk to an advisor</span>
                <span className="text-[0.9rem] font-semibold">+92 300 000 0000</span>
              </span>
            </a>
          </div>
          <AdminEntry dark />
        </div>
      </aside>

      {/* ---------------- Right content column ---------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile/tablet slim top bar */}
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-white px-4 py-2.5 lg:hidden">
          <div className="flex items-center gap-2">
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              aria-label="My account"
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-soft"
            >
              <UserIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/saved"
              aria-label={`Saved properties (${saved.items.length})`}
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-soft"
            >
              <HeartIcon className="h-5 w-5" />
              {saved.items.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-[17px] w-[17px] place-items-center rounded-full bg-brand text-[0.6rem] font-extrabold text-white">
                  {saved.items.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {children}
      </div>

      {/* ---------------- Mobile LEFT slide-in drawer ---------------- */}
      {open && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <div className="absolute inset-0 bg-brand-2/50 backdrop-blur-sm" onClick={close} />
          <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col overflow-y-auto bg-brand-2 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
              <Logo light />
              <button
                aria-label="Close menu"
                onClick={close}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/20 text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              <div>
                <GroupLabel dark>Browse</GroupLabel>
                <div className="mt-2 space-y-1">
                  {MAIN.map((l) => (
                    <NavRow key={l.href} href={l.href} label={l.label} active={active(l.match)} onClick={close} dark />
                  ))}
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <GroupLabel dark>My account</GroupLabel>
                <div className="mt-2 space-y-1">
                  <NavRow href="/account" label="My account" icon={UserIcon} active={active("/account")} onClick={close} dark />
                  <NavRow href="/saved" label="Saved" icon={HeartIcon} active={active("/saved")} onClick={close} dark />
                  <NavRow href="/sell" label="List property" icon={GridIcon} active={active("/sell")} onClick={close} dark />
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <AdminEntry onNavigate={close} dark />
            </div>
            <div className="border-t border-white/10 px-4 py-3">
              <a href="tel:+923000000000" className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gold/20 text-gold-2"><PhoneIcon className="h-4 w-4" /></span>
                +92 300 000 0000
              </a>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
