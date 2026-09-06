"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCollection } from "@/lib/client/collections";
import type { Listing } from "@/lib/data/types";
import { PropertyCard } from "@/components/property-card";
import { HeartIcon, GridIcon, UserIcon } from "@/components/ui/icons";
import { cx } from "@/lib/utils";

/**
 * CUSTOMER (buyer) dashboard — completely separate from the Admin Panel.
 * Lives at /account. Aggregates the visitor's own activity on this device:
 * saved favourites, compare basket and a simple profile.
 */

type Tab = "overview" | "saved" | "compare" | "profile";

const TABS: { id: Tab; label: string; icon: typeof HeartIcon }[] = [
  { id: "overview", label: "Overview", icon: GridIcon },
  { id: "saved", label: "Saved properties", icon: HeartIcon },
  { id: "compare", label: "Compare", icon: GridIcon },
  { id: "profile", label: "My profile", icon: UserIcon },
];

export default function AccountPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const saved = useCollection("saved");
  const compare = useCollection("compare");
  const [savedItems, setSavedItems] = useState<Listing[]>([]);
  const [compareItems, setCompareItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  const savedCount = saved.items.length;
  const compareCount = compare.items.length;
  const ids = [...new Set([...saved.items, ...compare.items])];

  useEffect(() => {
    if (!ids.length) {
      setSavedItems([]);
      setCompareItems([]);
      return;
    }
    setLoading(true);
    fetch(`/api/listings?ids=${encodeURIComponent(ids.join(","))}`)
      .then((r) => r.json())
      .then((d) => {
        const all: Listing[] = d.items ?? [];
        setSavedItems(all.filter((l) => saved.items.includes(l.id)));
        setCompareItems(all.filter((l) => compare.items.includes(l.id)));
      })
      .catch(() => {
        setSavedItems([]);
        setCompareItems([]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCount, compareCount, ids.join(",")]);

  const Empty = ({ title, text }: { title: string; text: string }) => (
    <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
      <div className="text-4xl">📂</div>
      <p className="mt-3 text-lg font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-mut">{text}</p>
      <Link href="/properties" className="btn btn-emerald mt-5">Browse properties</Link>
    </div>
  );

  const grid = (items: Listing[], title: string, text: string) =>
    loading ? (
      <p className="py-16 text-center text-mut">Loading…</p>
    ) : items.length === 0 ? (
      <Empty title={title} text={text} />
    ) : (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((l) => (
          <PropertyCard key={l.id} listing={l} />
        ))}
      </div>
    );

  return (
    <div className="min-h-screen bg-cream2">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:py-10">
        {/* left sidebar — always on the side */}
        <aside className="h-max shrink-0 rounded-2xl border border-linesoft bg-white p-3 shadow-sm lg:sticky lg:top-6 lg:w-56">
          <div className="px-3 pb-3 pt-1">
            <div className="text-xs font-extrabold uppercase tracking-widest text-mut">My Account</div>
            <div className="mt-1 text-sm font-bold text-ink">Property Finder</div>
          </div>
          <nav className="flex flex-col gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  tab === t.id ? "bg-emerald text-white" : "text-ink-soft hover:bg-cream2 hover:text-emerald",
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
                {t.id === "saved" && savedCount > 0 && (
                  <span className="ml-auto rounded-full bg-emerald/10 px-2 text-xs font-bold text-emerald">{savedCount}</span>
                )}
                {t.id === "compare" && compareCount > 0 && (
                  <span className="ml-auto rounded-full bg-emerald/10 px-2 text-xs font-bold text-emerald">{compareCount}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-3 border-t border-linesoft pt-3">
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-mut hover:text-emerald">
              ← Back to site
            </Link>
          </div>
        </aside>

        {/* main content */}
        <div className="min-w-0 flex-1">
          {tab === "overview" && (
            <>
              <h1 className="text-2xl font-extrabold text-ink">My dashboard</h1>
              <p className="mt-1 text-mut">Your saved properties and compare list.</p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button onClick={() => setTab("saved")} className="rounded-2xl border border-linesoft bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald/10 text-emerald"><HeartIcon className="h-5 w-5" /></div>
                    <span className="font-serif text-3xl font-bold text-ink">{savedCount}</span>
                  </div>
                  <div className="mt-4 text-base font-extrabold text-ink">Saved properties</div>
                  <div className="mt-1 text-sm text-emerald">View saved →</div>
                </button>
                <button onClick={() => setTab("compare")} className="rounded-2xl border border-linesoft bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald/10 text-emerald"><GridIcon className="h-5 w-5" /></div>
                    <span className="font-serif text-3xl font-bold text-ink">{compareCount}</span>
                  </div>
                  <div className="mt-4 text-base font-extrabold text-ink">Compare list</div>
                  <div className="mt-1 text-sm text-emerald">Open compare →</div>
                </button>
              </div>
              <div className="mt-6 rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
                <h2 className="text-base font-extrabold text-ink">Customer space</h2>
                <p className="mt-1 text-sm leading-relaxed text-mut">
                  This is the buyer dashboard — separate from the admin panel. Your saved properties and
                  compare list are kept on this device. Full customer accounts (sync, enquiries &amp; saved
                  searches) activate when Supabase Auth is configured.
                </p>
              </div>
            </>
          )}

          {tab === "saved" && (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-ink">Saved properties</h1>
                  <p className="mt-1 text-mut">{savedCount} saved on this device.</p>
                </div>
                {savedCount > 0 && (
                  <button onClick={saved.clear} className="btn btn-ghost btn-sm">Clear all</button>
                )}
              </div>
              <div className="mt-6">{grid(savedItems, "No saved properties yet", "Tap the heart on any property to keep it here.")}</div>
            </>
          )}

          {tab === "compare" && (
            <>
              <h1 className="text-2xl font-extrabold text-ink">Compare</h1>
              <p className="mt-1 text-mut">{compareCount} of max 4 in your compare list.</p>
              <div className="mt-6">
                {grid(compareItems, "Nothing to compare yet", "Add 2–4 properties to compare them side by side.")}
                {compareCount > 0 && (
                  <Link href={`/compare?ids=${compare.items.join(",")}`} className="btn btn-emerald mt-6">
                    Open full comparison
                  </Link>
                )}
              </div>
            </>
          )}

          {tab === "profile" && (
            <>
              <h1 className="text-2xl font-extrabold text-ink">My profile</h1>
              <p className="mt-1 text-mut">Details used when you enquire about a property.</p>
              <div className="mt-6 max-w-lg space-y-4 rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-mut">Full name</label>
                  <input className="input" placeholder="e.g. Ahmed Khan" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-mut">Phone</label>
                  <input className="input" placeholder="+92 3XX XXXXXXX" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-mut">Email</label>
                  <input className="input" type="email" placeholder="you@email.com" />
                </div>
                <button className="btn btn-emerald">Save profile</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
