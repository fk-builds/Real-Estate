import type {
  PropertyKind,
  PropertyPurpose,
  PropertyStatus,
  SearchFilters,
} from "@/lib/data/types";
import { PROPERTY_KIND_KEYS } from "@/lib/site";

/**
 * URL search-param model for the advanced search.
 * Canonical wire keys are `listing` (sale/rent/lease) + `type` (property type)
 * so URLs read naturally, e.g.
 *   /properties?city=lahore&type=house&listing=sale&min_price=10..&max_price=50..
 * The older `purpose` / `kind` aliases are still accepted on read for
 * backwards-compat with links elsewhere in the app.
 */

export type SortKey =
  | "newest" | "oldest" | "price_asc" | "price_desc" | "views" | "featured" | "relevance";

export interface SearchParams {
  q?: string;
  purpose?: PropertyPurpose;
  kind?: PropertyKind;
  status?: PropertyStatus;
  city?: string;
  area?: string;
  project?: string;
  phase?: string;
  sector?: string;
  block?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  size?: string;
  feature?: string;
  verified?: boolean;
  featured?: boolean;
  sort?: SortKey;
  page?: number;
}

type Raw = Record<string, string | string[] | undefined>;

const PURPOSES: PropertyPurpose[] = ["sale", "rent", "lease"];
const STATUSES: PropertyStatus[] = [
  "available", "sold", "rented", "reserved", "under_offer", "pending_verification", "draft",
];
const SORTS: SortKey[] = [
  "newest", "oldest", "price_asc", "price_desc", "views", "featured", "relevance",
];

function truthy(v: string | undefined): boolean {
  return v === "1" || v === "true" || v === "on" || v === "yes";
}
function first(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
}
function num(v: string | undefined): number | undefined {
  if (v == null) return undefined;
  const n = Number(v.replace(/[,₹PKR\s]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

/** Parse raw searchParams into a typed model (supports purpose/kind aliases). */
export function parseSearchParams(sp: Raw): SearchParams {
  const g = (k: string) => first(sp[k]);
  const purposeRaw = (g("listing") || g("purpose")) as string;
  const kindRaw = (g("type") || g("kind")) as string;
  const p: SearchParams = {
    q: g("q"),
    purpose: PURPOSES.includes(purposeRaw as PropertyPurpose) ? (purposeRaw as PropertyPurpose) : undefined,
    kind: PROPERTY_KIND_KEYS.includes(kindRaw) ? (kindRaw as PropertyKind) : undefined,
    status: STATUSES.includes((g("status") ?? "") as PropertyStatus) ? (g("status") as PropertyStatus) : undefined,
    city: g("city"),
    area: g("area"),
    project: g("project"),
    phase: g("phase"),
    sector: g("sector"),
    block: g("block"),
    minPrice: num(g("min_price") ?? g("minPrice")),
    maxPrice: num(g("max_price") ?? g("maxPrice")),
    beds: num(g("beds")),
    baths: num(g("baths")),
    size: g("size"),
    feature: g("feature"),
    verified: g("verified") ? truthy(g("verified")) : undefined,
    featured: g("featured") ? truthy(g("featured")) : undefined,
    sort: SORTS.includes((g("sort") ?? "") as SortKey) ? (g("sort") as SortKey) : undefined,
    page: num(g("page")) && Number(g("page")) >= 1 ? Number(g("page")) : undefined,
  };
  return p;
}

/** Map the typed model to SearchFilters for the store. */
export function toFilters(p: SearchParams): SearchFilters {
  return {
    q: p.q,
    purpose: p.purpose,
    kind: p.kind,
    citySlug: p.city,
    area: p.area,
    project: p.project,
    phase: p.phase,
    sector: p.sector,
    block: p.block,
    minPrice: p.minPrice,
    maxPrice: p.maxPrice,
    beds: p.beds,
    baths: p.baths,
    size: p.size,
    feature: p.feature,
    verified: p.verified,
    featured: p.featured,
    status: p.status,
  };
}

function set(qs: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null || value === "") return;
  qs.set(key, String(value));
}

/** Serialize the model back to a canonical `/properties?...` query string. */
export function toQueryString(p: SearchParams): string {
  const qs = new URLSearchParams();
  set(qs, "q", p.q);
  set(qs, "listing", p.purpose);
  set(qs, "type", p.kind);
  set(qs, "status", p.status);
  set(qs, "city", p.city);
  set(qs, "area", p.area);
  set(qs, "project", p.project);
  set(qs, "phase", p.phase);
  set(qs, "sector", p.sector);
  set(qs, "block", p.block);
  set(qs, "min_price", p.minPrice);
  set(qs, "max_price", p.maxPrice);
  set(qs, "beds", p.beds);
  set(qs, "baths", p.baths);
  set(qs, "size", p.size);
  set(qs, "feature", p.feature);
  if (p.verified) qs.set("verified", "1");
  if (p.featured) qs.set("featured", "1");
  set(qs, "sort", p.sort);
  set(qs, "page", p.page);
  return qs.toString();
}

/** Build a full `/properties?...` href from a model. */
export function buildSearchHref(p: SearchParams): string {
  const s = toQueryString(p);
  return `/properties${s ? "?" + s : ""}`;
}
