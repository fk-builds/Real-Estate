import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { searchListings, getStore } from "@/lib/data/provider";
import type { SearchFilters } from "@/lib/data/types";
import { PropertyCard } from "@/components/property-card";
import { FilterPanel } from "@/components/search/filters";
import { SearchMap } from "@/components/map/search-map";
import { toMapListing } from "@/lib/data/map-geo";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { kindLabels, purposeLabels, site } from "@/lib/site";
import { cx } from "@/lib/utils";
import { parseSearchParams, toFilters, buildSearchHref } from "@/lib/search/params";
import type { SearchParams } from "@/lib/search/params";
import { FEATURE_DEFAULTS } from "@/lib/data/features";

type Raw = { [key: string]: string | string[] | undefined };

function rawFrom(sp: Raw): SearchParams {
  return parseSearchParams(sp);
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Raw> }): Promise<Metadata> {
  const p = rawFrom(await searchParams);
  const purpose = p.purpose ? purposeLabels[p.purpose] : "Properties";
  const kind = p.kind ? kindLabels[p.kind] : null;
  const where = [p.city, p.area, p.project].filter(Boolean).join(", ");
  const title = [kind, purpose, where && `in ${where}`].filter(Boolean).join(" ") + " in Pakistan";
  return {
    title,
    description: `Browse ${(kind ?? "verified").toLowerCase()} properties ${where ? `in ${where} ` : ""}across Pakistan — refine by price, size, beds and features on ${site.name}.`,
    alternates: { canonical: buildSearchHref({ ...p, page: undefined }) },
  };
}

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<Raw> }) {
  const p = rawFrom(await searchParams);
  const page = p.page ?? 1;
  const filters: SearchFilters = toFilters(p);

  const store = await getStore();
  const [{ items, total, totalPages }, cities] = await Promise.all([
    searchListings(filters, { page, pageSize: 6, sort: p.sort ?? "newest" }),
    store.getCities(),
  ]);

  const purpose = p.purpose ? purposeLabels[p.purpose] : null;
  const kind = p.kind ? kindLabels[p.kind] : null;
  const heading = [kind, purpose && `· ${purpose}`, p.city && `· ${cap(p.city)}`, p.area && `· ${p.area}`]
    .filter(Boolean).join(" ") || "Properties in Pakistan";

  return (
    <>
      {/* page head */}
      <div className="bg-gradient-to-r from-emerald-2 via-emerald-3 to-emerald-2 py-11 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="mb-3 flex flex-wrap gap-2 text-[0.85rem] text-[#bfd6cc]">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="text-white/40">/</span>
            <span>{(purpose ?? "Properties")}</span>
            {kind && (<><span className="text-white/40">/</span><span>{kind}</span></>)}
            {p.city && (<><span className="text-white/40">/</span><span className="capitalize">{p.city}</span></>)}
            {p.area && (<><span className="text-white/40">/</span><span>{p.area}</span></>)}
          </nav>
          <h1 className="font-serif text-[clamp(1.9rem,3.8vw,2.8rem)] font-semibold leading-tight">{heading}</h1>
          <p className="mt-2 text-[#d5e3db]">{total.toLocaleString("en-PK")} verified {purpose?.toLowerCase() ?? "property"} matches across Pakistan.</p>
        </div>
      </div>

      {/* content */}
      <div className="mx-auto -mt-7 max-w-7xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <FilterPanel cities={cities} />

          <div className="min-w-0">
            <ActiveChips p={p} />
            <ResultsBar total={total} p={p} page={page} />
            {items.length > 0 && (
              <div className="mb-7">
                <SearchMap listings={items.map(toMapListing)} />
              </div>
            )}
            <Suspense fallback={<p className="py-10 text-center text-mut">Loading properties…</p>}>
              {items.length ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((l) => <PropertyCard key={l.id} listing={l} />)}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
                  <div className="text-4xl">🔍</div>
                  <p className="mt-3 font-bold text-ink">No properties matched your filters.</p>
                  <p className="mt-1 text-sm text-mut">Try widening the budget or location, or browse all listings.</p>
                  <Link href="/properties" className="btn btn-emerald mt-5">Clear all filters</Link>
                </div>
              )}
            </Suspense>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap justify-center gap-2">
                {range(1, totalPages).map((n) => {
                  const on = n === page;
                  return (
                    <Link key={n} href={buildSearchHref({ ...p, page: n })}
                      className={cx("grid h-10 min-w-10 place-items-center rounded-xl border px-2 font-bold transition",
                        on ? "border-emerald bg-emerald text-white" : "border-line bg-white text-ink-soft hover:border-emerald hover:text-emerald")}>
                      {n}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: purpose ?? "Properties", path: "/properties" }])} />
    </>
  );
}

/** Removable chips for every active filter — each links to the URL without it. */
function ActiveChips({ p }: { p: SearchParams }) {
  type Chip = { key: string; label: string; remove: SearchParams };
  const chips: Chip[] = [];
  const put = (label: string, remove: SearchParams) => chips.push({ key: removeKey(label), label, remove });
  if (p.q) put(`“${p.q}”`, { ...p, q: undefined });
  if (p.kind) put(kindLabels[p.kind] ?? p.kind, { ...p, kind: undefined });
  if (p.purpose) put(purposeLabels[p.purpose], { ...p, purpose: undefined });
  if (p.city) put(cap(p.city), { ...p, city: undefined });
  if (p.area) put(`Area: ${p.area}`, { ...p, area: undefined });
  if (p.project) put(`Project: ${p.project}`, { ...p, project: undefined });
  if (p.phase) put(`Phase: ${p.phase}`, { ...p, phase: undefined });
  if (p.sector) put(`Sector: ${p.sector}`, { ...p, sector: undefined });
  if (p.block) put(`Block: ${p.block}`, { ...p, block: undefined });
  if (p.minPrice != null || p.maxPrice != null) {
    const lo = p.minPrice != null ? `${(p.minPrice / 1e6).toFixed(1)}Cr` : null;
    const hi = p.maxPrice != null ? `${(p.maxPrice / 1e6).toFixed(1)}Cr` : null;
    put(`Price ${lo ? (hi ? `${lo}–${hi}` : `${lo}+`) : `≤ ${hi}`}`, { ...p, minPrice: undefined, maxPrice: undefined });
  }
  if (p.beds) put(`${p.beds}+ Beds`, { ...p, beds: undefined });
  if (p.baths) put(`${p.baths}+ Baths`, { ...p, baths: undefined });
  if (p.size) put(sizeLabel(p.size), { ...p, size: undefined });
  if (p.feature) put(featureLabel(p.feature), { ...p, feature: undefined });
  if (p.verified) put("Verified", { ...p, verified: undefined });
  if (p.featured) put("Featured", { ...p, featured: undefined });

  if (!chips.length) return null;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-[0.72rem] font-extrabold uppercase tracking-wider text-mut">Filters</span>
      {chips.map((c) => (
        <Link key={c.key} href={buildSearchHref({ ...c.remove, page: undefined })} title="Remove filter"
          className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-3 pr-2 text-xs font-bold text-ink-soft transition hover:border-emerald hover:text-emerald">
          {c.label}
          <span className="grid h-4 w-4 place-items-center rounded-full bg-cream text-[0.7rem] transition group-hover:bg-emerald group-hover:text-white">×</span>
        </Link>
      ))}
    </div>
  );
}

function ResultsBar({ total, p, page }: { total: number; p: SearchParams; page: number }) {
  const sorts: Array<{ v: SearchParams["sort"]; l: string }> = [
    { v: "newest", l: "Newest" },
    { v: "oldest", l: "Oldest" },
    { v: "price_asc", l: "Price: low → high" },
    { v: "price_desc", l: "Price: high → low" },
    { v: "views", l: "Most viewed" },
    { v: "featured", l: "Featured" },
    { v: "relevance", l: "Relevance" },
  ];
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="font-extrabold text-ink">
        {total.toLocaleString("en-PK")} <span className="text-emerald">properties</span>
        {page > 1 ? ` · page ${page}` : ""}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-ink-soft">Sort</span>
        <div className="flex flex-wrap gap-1.5">
          {sorts.map((s) => {
            const on = (p.sort ?? "newest") === s.v;
            return (
              <a key={s.v} href={buildSearchHref({ ...p, sort: s.v, page: undefined })}
                className={cx("rounded-full px-3.5 py-1.5 text-[0.82rem] font-bold transition",
                  on ? "bg-emerald text-white" : "bg-white text-mut hover:text-ink")}>
                {s.l}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function range(a: number, b: number) {
  return Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function removeKey(label: string) { return label.toLowerCase().replace(/[^a-z0-9]+/g, "-"); }
function sizeLabel(v: string) {
  return ({ "under-5-marla": "Under 5 Marla", "5-10-marla": "5–10 Marla", "10m-1k": "10 Marla – 1 Kanal", "1-2-kanal": "1–2 Kanal", "2-plus-kanal": "2 Kanal+" } as Record<string, string>)[v] ?? v;
}
function featureLabel(key: string) {
  return FEATURE_DEFAULTS.find((f) => f.key === key)?.label ?? key.replace(/-/g, " ");
}
