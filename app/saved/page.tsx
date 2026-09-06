"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCollection } from "@/lib/client/collections";
import type { Listing } from "@/lib/data/types";
import { PropertyCard } from "@/components/property-card";

export default function SavedPage() {
  const saved = useCollection("saved");
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!saved.items.length) {
      setItems([]);
      return;
    }
    setLoading(true);
    fetch(`/api/listings?ids=${encodeURIComponent(saved.items.join(","))}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [saved.items.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold text-ink">
            Saved properties
          </h1>
          <p className="mt-1 text-mut">
            {saved.items.length} {saved.items.length === 1 ? "property" : "properties"} — saved on this device.
          </p>
        </div>
        {saved.items.length > 0 && (
          <div className="flex gap-2">
            <button onClick={saved.clear} className="btn btn-ghost btn-sm">
              Clear all
            </button>
            <Link href="/properties" className="btn btn-emerald btn-sm">
              Browse more
            </Link>
          </div>
        )}
      </div>

      {saved.items.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-dashed border-line bg-white p-16 text-center">
          <div className="text-5xl">🤍</div>
          <p className="mt-4 text-lg font-bold text-ink">Nothing saved yet</p>
          <p className="mt-1 text-sm text-mut">Tap the heart on any property to keep it here for later.</p>
          <Link href="/properties" className="btn btn-emerald mt-6">
            Start browsing
          </Link>
        </div>
      ) : loading ? (
        <p className="py-16 text-center text-mut">Loading your saved properties…</p>
      ) : items.length ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => (
            <PropertyCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-mut">Some saved items are no longer available.</p>
      )}
    </div>
  );
}
