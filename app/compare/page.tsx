import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStore } from "@/lib/data/provider";
import type { Listing } from "@/lib/data/types";

type P = { searchParams: Promise<{ ids?: string }> };

export const metadata: Metadata = {
  title: "Compare properties side by side",
  description: "Compare up to four properties side by side to find the right one.",
  robots: { index: false },
};

export default async function ComparePage({ searchParams }: P) {
  const { ids } = await searchParams;
  const idList = (ids ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4);

  const store = await getStore();
  const list = idList.length ? await store.getBySlugs(idList) : [];

  if (!list.length) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center">
        <div className="text-5xl">⚖️</div>
        <h1 className="mt-5 font-serif text-3xl font-semibold text-ink">Nothing to compare yet</h1>
        <p className="mt-2 text-mut">Add at least two properties using the + button, then compare them here.</p>
        <Link href="/properties" className="btn btn-emerald mt-6">Browse properties</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.5rem)] font-semibold text-ink">
            Compare properties
          </h1>
          <p className="mt-1 text-mut">{list.length} selected — side by side</p>
        </div>
        <div className="flex gap-2">
          <Link href="/properties" className="btn btn-ghost btn-sm">+ Add more</Link>
          <Link href="/compare?ids=" className="btn btn-light btn-sm">Clear</Link>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-linesoft bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-cream/60">
              <th className="w-40 p-4 text-left align-bottom text-xs font-bold uppercase tracking-wide text-mut">
                <span className="sr-only">Attribute</span>
              </th>
              {list.map((l) => (
                <th key={l.id} className="p-4 text-left align-top">
                  <Link href={`/property/${l.slug}`} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                      <Image src={l.coverImage} alt={l.title} fill className="object-cover transition group-hover:scale-105" sizes="220px" />
                    </div>
                    <div className="mt-2 font-serif text-base font-bold text-emerald">{l.priceDisplay}</div>
                    <div className="mt-0.5 line-clamp-2 font-semibold leading-snug text-ink group-hover:text-emerald">{l.title}</div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows(list).map((r) => (
              <tr key={r.label} className="border-b border-linesoft last:border-0">
                <td className="bg-cream/40 p-3.5 text-xs font-bold uppercase tracking-wide text-mut">{r.label}</td>
                {r.values.map((v, i) => (
                  <td key={i} className="p-3.5 align-top text-[0.95rem] text-body">
                    {v ?? <span className="text-line">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function rows(list: Listing[]) {
  const cells = (get: (l: Listing) => React.ReactNode) => list.map((l) => get(l));
  const location = (l: Listing) => (
    <div>
      <div className="font-semibold text-ink">{l.areaLabel}</div>
      <div className="text-sm text-mut">{l.cityName}</div>
    </div>
  );
  return [
    { label: "Purpose", values: cells((l) => (l.purpose === "rent" ? "For rent" : l.purpose === "lease" ? "For lease" : "For sale")) },
    { label: "Type", values: cells((l) => l.kind) },
    { label: "Location", values: cells(location) },
    { label: "Beds", values: cells((l) => (l.beds ? l.beds : "—")) },
    { label: "Baths", values: cells((l) => (l.baths ? l.baths : "—")) },
    { label: "Area", values: cells((l) => l.areaRaw) },
    ...(list.some((l) => l.plotNumber) ? [{ label: "Plot / unit", values: cells((l) => l.plotNumber) }] : []),
    { label: "Verified", values: cells((l) => (l.verified ? "✓ Verified" : "Unverified")) },
    { label: "Key features", values: cells((l) => (l.features?.length ? l.features.slice(0, 3).join(" · ") : "—")) },
  ];
}
