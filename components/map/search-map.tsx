"use client";

import { useEffect, useMemo, useRef, useState } from "react";
// Leaflet CSS is tiny and needed the moment the map mounts; the map *engine*
// (the heavy part) is still `import()`ed lazily below — never in the bundle.
import "leaflet/dist/leaflet.css";
import { CITY_CENTERS, PROJECT_BOUNDARIES, type MapListing } from "@/lib/data/map-geo";

/**
 * INTERACTIVE PROPERTY MAP (client-only, lazy).
 *
 * Cost discipline: the heavy map engine (Leaflet + tile layers + geojson) is
 * NOT shipped in the page bundle. It is `import()`ed only after the visitor
 * clicks "Load map". Until then only a lightweight, dependency-free summary is
 * rendered. Markers come from listing coordinates; project/society boundaries
 * are drawn as polygons where geography is known; clicking a marker opens a
 * compact property popup card.
 */
export function SearchMap({ listings }: { listings: MapListing[] }) {
  const [on, setOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  const located = useMemo(() => listings.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng)), [listings]);

  useEffect(() => {
    return () => {
      // @ts-expect-error leaflet Map#remove
      if (mapRef.current && typeof mapRef.current.remove === "function") mapRef.current.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!on || !host.current) return;
    let disposed = false;
    setLoading(true);
    (async () => {
      const L: any = (await import("leaflet")).default;
      if (disposed || !host.current) return;
      const map = L.map(host.current, { zoomControl: true, scrollWheelZoom: false });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // markers + popup mini-cards
      const group = L.featureGroup().addTo(map);
      located.forEach((l) => {
        const color = l.purpose === "rent" ? "#d99a26" : "#0e9f6e";
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:20px;height:20px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        const m = L.marker([l.lat as number, l.lng as number], { icon });
        m.bindPopup(popupHtml(l), { maxWidth: 248, minWidth: 220 });
        m.addTo(group);
      });

      // project / society boundaries whose geography overlaps this result set
      const markerCities = new Set(located.map((l) => l.citySlug));
      const poly = L.featureGroup().addTo(map);
      PROJECT_BOUNDARIES.forEach((b) => {
        const nearby = markerCities.has(b.citySlug) || located.some((l) => l.projectSlug === b.slug);
        if (!nearby) return;
        L.polygon(b.ring as unknown as [number, number][], {
          color: "#0e9f6e", weight: 2, fillColor: "#0e9f6e", fillOpacity: 0.07,
        }).bindTooltip(b.name, { sticky: true }).addTo(poly);
      });

      if (group.getLayers().length) {
        map.fitBounds(group.getBounds().pad(0.25));
      } else if (poly.getLayers().length) {
        map.fitBounds(poly.getBounds().pad(0.15));
      } else {
        const centre = CITY_CENTERS[located[0]?.citySlug ?? ""] ?? CITY_CENTERS.lahore;
        map.setView([centre.lat, centre.lng], centre.zoom);
      }
      setLoading(false);
    })().catch(() => setLoading(false));
    return () => {
      disposed = true;
    };
  }, [on, located]);

  const areaCounts = useMemo(() => {
    const map = new Map<string, number>();
    listings.forEach((l) => map.set(l.areaLabel, (map.get(l.areaLabel) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [listings]);
  const projCounts = useMemo(() => {
    const map = new Map<string, number>();
    listings.forEach((l) => l.projectName && map.set(l.projectName, (map.get(l.projectName) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [listings]);

  return (
    <section aria-label="Interactive map" className="overflow-hidden rounded-2xl border border-linesoft bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <div className="flex items-center gap-2 font-serif text-lg font-semibold text-ink">
            <span className="text-xl">🗺️</span> Map view
          </div>
          <p className="text-xs text-mut">
            {located.length} of {listings.length} matched properties have map locations
            {projCounts.length ? ` · ${projCounts.length} project boundary${projCounts.length > 1 ? "s" : ""} available` : ""}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOn((v) => !v)}
          className="btn btn-emerald !px-4 !py-2 text-sm"
        >
          {on ? "Hide map" : "Load interactive map"}
        </button>
      </div>

      {/* location information (always cheap to render) */}
      {(areaCounts.length > 0 || projCounts.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-cream/40 px-5 py-2.5 text-xs">
          <span className="font-extrabold uppercase tracking-wide text-mut">Location info:</span>
          {projCounts.map(([name, n]) => (
            <span key={name} className="rounded-full border border-emerald/30 bg-white px-2.5 py-0.5 font-bold text-emerald">
              {name} · {n}
            </span>
          ))}
          {areaCounts.map(([name, n]) => (
            <span key={name} className="rounded-full border border-line bg-white px-2.5 py-0.5 font-semibold text-ink-soft">
              {name} · {n}
            </span>
          ))}
        </div>
      )}

      {!on ? (
        <button
          type="button"
          onClick={() => setOn(true)}
          className="group grid w-full place-items-center gap-2 px-6 py-12 text-center"
        >
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald/10 text-2xl transition group-hover:bg-emerald/20">🗺️</div>
          <div className="font-bold text-ink">Explore results on a live map</div>
          <div className="max-w-sm text-sm text-mut">
            See every matched property as a pin, tap a pin for a quick property card, and view {PROJECT_BOUNDARIES.length} housing-society boundaries where available.
          </div>
          <span className="mt-1 text-sm font-bold text-emerald">Load interactive map →</span>
        </button>
      ) : (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-[500] grid place-items-center bg-white/80 text-sm font-bold text-ink">
              Loading interactive map…
            </div>
          )}
          <div ref={host} className="h-[520px] w-full" />
          <p className="px-5 py-2 text-center text-[0.7rem] text-mut">
            Boundaries are indicative. Markers show approximate listing locations.
          </p>
        </div>
      )}
    </section>
  );
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Compact property popup card shown when a marker is tapped. */
function popupHtml(l: MapListing): string {
  const area = esc([l.areaLabel, l.cityName].filter(Boolean).join(", "));
  const loc = esc([l.projectName, l.phase, l.sector, l.block].filter(Boolean).join(" › "));
  const plot = l.plotNumber ? `<div style="margin-top:3px;color:#5b6b64;font-size:11px"># ${esc(l.plotNumber)}</div>` : "";
  return `<div style="width:224px;line-height:1.35">
    <a href="/property/${esc(l.slug)}" style="text-decoration:none;color:inherit;display:block">
      <img src="${esc(l.coverImage)}" alt="${esc(l.title)}" loading="lazy" style="width:100%;height:118px;object-fit:cover;border-radius:8px;display:block;background:#eef1ef"/>
      <div style="margin-top:6px;font-weight:800;color:#11231c">${esc(l.priceDisplay)}</div>
      <div style="margin-top:2px;font-weight:600;color:#0e9f6e;font-size:12px">${area}</div>
      ${loc ? `<div style="margin-top:2px;color:#5b6b64;font-size:11px">${loc}</div>` : ""}
      ${plot}
      <div style="margin-top:6px;color:#0e9f6e;font-weight:700;font-size:12px">View property →</div>
    </a>
  </div>`;
}
