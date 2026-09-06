"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { CityOption } from "@/lib/data/types";
import { SIZE_BANDS } from "@/lib/data/types";
import { KIND_GROUPS } from "@/lib/site";
import { FEATURE_DEFAULTS } from "@/lib/data/features";
import { parseSearchParams, buildSearchHref } from "@/lib/search/params";
import type { SearchParams } from "@/lib/search/params";
import { cx } from "@/lib/utils";
import { CloseIcon } from "@/components/ui/icons";

const PURPOSES = [
  { v: "sale", l: "Buy" },
  { v: "rent", l: "Rent" },
  { v: "lease", l: "Lease" },
] as const;

/**
 * Advanced search filter panel. Editing immediately rewrites the URL
 * (server re-render) so every filter is crawlable & shareable. A mobile
 * drawer provides the same controls on small screens.
 */
export function FilterPanel({ cities }: { cities: CityOption[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // current typed params derived from the URL
  const p = useMemo(() => {
    const raw: Record<string, string> = {};
    sp.forEach((v, k) => (raw[k] = v));
    return parseSearchParams(raw);
  }, [sp]);

  const go = (patch: Partial<SearchParams>) => {
    setOpen(false);
    startTransition(() => router.push(buildSearchHref({ ...p, ...patch, page: undefined })));
  };

  const activeCount = countActive(p);

  return (
    <>
      {/* desktop sidebar */}
      <div className="hidden h-max lg:block">
        <Controls p={p} go={go} cities={cities} activeCount={activeCount} reset={() => router.push("/properties")} />
      </div>

      {/* mobile filter button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-bold text-white shadow-2xl transition hover:bg-emerald-3 lg:hidden"
      >
        Filters
        {activeCount > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-extrabold text-emerald">{activeCount}</span>
        )}
      </button>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <div className="absolute inset-0 bg-emerald-2/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-cream p-6 pb-10">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-serif text-2xl font-semibold text-ink">Filters</h3>
              <button onClick={() => setOpen(false)} aria-label="Close filters"
                className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-ink">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <Controls p={p} go={go} cities={cities} activeCount={activeCount} reset={() => { setOpen(false); router.push("/properties"); }} />
          </div>
        </div>
      )}
    </>
  );
}

function Controls({ p, go, cities, reset }: {
  p: SearchParams;
  go: (patch: Partial<SearchParams>) => void;
  cities: CityOption[];
  reset: () => void;
  activeCount?: number;
}) {
  return (
    <div className="rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-ink">Refine search</h3>
        <button onClick={reset} className="text-sm font-bold text-emerald hover:underline">Reset</button>
      </div>

      {/* purpose */}
      <Label>For sale or rent</Label>
      <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-cream p-1">
        {PURPOSES.map((pu) => (
          <button key={pu.v} onClick={() => go({ purpose: (p.purpose === pu.v ? undefined : pu.v) })}
            className={cx("rounded-lg py-2 text-sm font-bold transition",
              p.purpose === pu.v ? "bg-emerald text-white shadow" : "text-ink-soft hover:text-emerald")}>
            {pu.l}
          </button>
        ))}
      </div>

      {/* keyword */}
      <Label>Keyword</Label>
      <TextField defaultValue={p.q ?? ""} placeholder="Location, project, corner, park-facing…" commit={(v) => go({ q: v || undefined })} />

      {/* type */}
      <Label>Property type</Label>
      <label className="ctl">
        <span className="text-gold-deep">▦</span>
        <select value={p.kind ?? ""} onChange={(e) => go({ kind: (e.target.value || undefined) as SearchParams["kind"] })}>
          <option value="">Any type</option>
          {KIND_GROUPS.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.kinds.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
            </optgroup>
          ))}
        </select>
      </label>

      {/* city */}
      <Label>City</Label>
      <label className="ctl">
        <span className="text-gold-deep">◎</span>
        <select value={p.city ?? ""} onChange={(e) => go({ city: e.target.value || undefined })}>
          <option value="">All Pakistan</option>
          {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </label>

      {/* area + project */}
      <Label>Area / society</Label>
      <TextField defaultValue={p.area ?? ""} placeholder="e.g. DHA Phase 8" commit={(v) => go({ area: v || undefined })} />
      <div className="mt-2">
        <TextField defaultValue={p.project ?? ""} placeholder="Project / society" commit={(v) => go({ project: v || undefined })} />
      </div>

      {/* phase / sector / block */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        <TextFieldSmall defaultValue={p.phase ?? ""} placeholder="Phase" commit={(v) => go({ phase: v || undefined })} />
        <TextFieldSmall defaultValue={p.sector ?? ""} placeholder="Sector" commit={(v) => go({ sector: v || undefined })} />
        <TextFieldSmall defaultValue={p.block ?? ""} placeholder="Block" commit={(v) => go({ block: v || undefined })} />
      </div>

      {/* price */}
      <Label>Price (PKR)</Label>
      <div className="flex items-center gap-2">
        <NumField defaultValue={p.minPrice} placeholder="Min" commit={(v) => go({ minPrice: v })} />
        <span className="text-mut">–</span>
        <NumField defaultValue={p.maxPrice} placeholder="Max" commit={(v) => go({ maxPrice: v })} />
      </div>

      {/* size */}
      <Label>Property size</Label>
      <label className="ctl">
        <span className="text-gold-deep">◧</span>
        <select value={p.size ?? ""} onChange={(e) => go({ size: e.target.value || undefined })}>
          {SIZE_BANDS.map((b) => <option key={b.v} value={b.v}>{b.label}</option>)}
        </select>
      </label>

      {/* beds / baths */}
      <Label>Bedrooms</Label>
      <ChipsRow value={p.beds} opts={["1", "2", "3", "4", "5+"]} onPick={(v) => go({ beds: v })} unit="+" />
      <Label>Bathrooms</Label>
      <ChipsRow value={p.baths} opts={["1", "2", "3", "4+"]} onPick={(v) => go({ baths: v })} unit="+" />

      {/* features */}
      <Label>Features</Label>
      <select value={p.feature ?? ""} onChange={(e) => go({ feature: e.target.value || undefined })} className="input">
        <option value="">Any feature</option>
        {FEATURE_DEFAULTS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
      </select>

      {/* verified / featured */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Toggle active={p.verified === true} label="Verified" onClick={() => go({ verified: p.verified ? undefined : true })} />
        <Toggle active={p.featured === true} label="Featured" onClick={() => go({ featured: p.featured ? undefined : true })} />
      </div>
    </div>
  );
}

function countActive(p: SearchParams): number {
  const keys: Array<keyof SearchParams> = [
    "q", "purpose", "kind", "city", "area", "project", "phase", "sector", "block",
    "minPrice", "maxPrice", "beds", "baths", "size", "feature", "verified", "featured",
  ];
  return keys.filter((k) => p[k] !== undefined && p[k] !== null && p[k] !== "").length;
}

function ChipsRow({ value, opts, onPick, unit }: { value?: number; opts: string[]; onPick: (v?: number) => void; unit: string }) {
  const cur = value ? String(value) : "";
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => {
        const val = o.endsWith("+") ? o.slice(0, -1) : o;
        const active = cur === val;
        return (
          <button key={o} onClick={() => onPick(active ? undefined : Number(val))}
            className={cx("chip", active && "on")}>{o}</button>
        );
      })}
    </div>
  );
}

function TextField({ defaultValue, placeholder, commit }: { defaultValue: string; placeholder: string; commit: (v: string) => void }) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div className="relative">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit(val)}
        onBlur={() => commit(val)}
        placeholder={placeholder}
        className="input pr-9"
      />
      <button onClick={() => commit(val)} aria-label="Apply"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-emerald">↵</button>
    </div>
  );
}
function TextFieldSmall(props: { defaultValue?: string; placeholder?: string; commit: (v: string) => void }) {
  return (
    <input
      defaultValue={props.defaultValue ?? ""}
      placeholder={props.placeholder}
      onKeyDown={(e) => e.key === "Enter" && props.commit((e.target as HTMLInputElement).value)}
      onBlur={(e) => props.commit(e.target.value)}
      className="input px-2 py-2 text-xs"
    />
  );
}
function NumField({ defaultValue, placeholder, commit }: { defaultValue?: number; placeholder: string; commit: (v?: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      onKeyDown={(e) => e.key === "Enter" && commit(parse(e.target as HTMLInputElement))}
      onBlur={(e) => commit(parse(e.target as HTMLInputElement))}
      className="input px-3 py-2 text-sm"
    />
  );
  function parse(el: HTMLInputElement) {
    const n = Number(el.value);
    return el.value && Number.isFinite(n) ? n : undefined;
  }
}
function Toggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cx("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition",
        active ? "border-emerald bg-emerald/10 text-emerald" : "border-line bg-white text-ink-soft hover:border-emerald/50")}>
      <span className={cx("grid h-4 w-4 place-items-center rounded-full border-2 transition",
        active ? "border-emerald bg-emerald" : "border-line bg-white")}>
        {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      {label}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mt-5 mb-2 block text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-mut">{children}</span>;
}
