import type { Store } from "./store";
import {
  areaSqft, sizeBandMin, sizeBandMax,
} from "./types";
import type {
  Listing,
  Project,
  CityOption,
  SearchFilters,
  SearchOptions,
  SearchResult,
} from "./types";
import { loadDb, type LocalDb } from "@/lib/db/local-db";
import { locationForListing } from "./hierarchy";
import { ensureMedia, coverOf } from "./media";
import { isPropertyNumberQuery, matchesPropertyNumber } from "@/lib/search/property-number";

/**
 * LocalStore — reads from the local JSON persistence (data/db.json), seeded on
 * first run and kept in sync with the admin dashboard.
 *
 * Location display fields (phase/sector/block/city/path) are NEVER read from
 * the listing — they are derived from the listing's locationId FK by climbing
 * the relational location tree, mirroring the Postgres hierarchy schema.
 */
export class LocalStore implements Store {
  readonly name = "local" as const;

  async search(filters: SearchFilters, opts: SearchOptions = {}): Promise<SearchResult> {
    const db = await loadDb();
    const { page = 1, pageSize = 12, sort = "newest" } = opts;

    // Enrich FIRST so location/project/feature tags (derived from the tree and
    // dictionary) are available to `matches` — e.g. phase/sector/block filters.
    let rows = db.listings
      .filter((l) => l.published !== false)
      .map((l) => this.enrich(db, l))
      .filter((l) => this.matches(l, filters));

    switch (sort) {
      case "price_asc":
        rows.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        rows.sort((a, b) => b.price - a.price);
        break;
      case "views":
        rows.sort((a, b) => b.views - a.views);
        break;
      case "featured":
        rows.sort((a, b) => Number(b.featured) - Number(a.featured) || byListed(b) - byListed(a));
        break;
      case "oldest":
        rows.sort((a, b) => byListed(a) - byListed(b));
        break;
      case "relevance":
        // best text match first (only meaningful with a keyword)
        rows.sort((a, b) => relevance(a, filters.q) - relevance(b, filters.q) || byListed(b) - byListed(a));
        break;
      case "newest":
      default:
        rows.sort((a, b) => byListed(b) - byListed(a));
    }

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize);
    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  private matches(l: Listing, f: SearchFilters): boolean {
    if (f.purpose && l.purpose !== f.purpose) return false;
    if (f.kind && l.kind !== f.kind) return false;
    if (f.status) {
      // explicit status filter (admin/moderator): show exactly that status
      if (l.status !== f.status) return false;
    } else if (l.status && l.status !== "available" && l.status !== "under_offer" && l.status !== "reserved") {
      // default public view: hide non-live statuses (sold/rented/pending/draft)
      return false;
    }
    if (f.citySlug && l.citySlug !== f.citySlug) return false;
    // location drill-downs (derived onto the listing by `enrich`)
    if (f.area && !(l.areaLabel + " " + (l.subArea ?? "")).toLowerCase().includes(f.area.toLowerCase())) return false;
    if (f.project) {
      const name = l.project ? `${l.project.name} ${l.project.slug}` : l.areaLabel;
      if (!name.toLowerCase().includes(f.project.toLowerCase())) return false;
    }
    if (f.phase && !((l.phase ?? "") + (l.locationPath ?? []).join(" ")).toLowerCase().includes(f.phase.toLowerCase()))
      return false;
    if (f.sector && !((l.sector ?? "") + (l.locationPath ?? []).join(" ")).toLowerCase().includes(f.sector.toLowerCase()))
      return false;
    if (f.block && !((l.block ?? "") + (l.locationPath ?? []).join(" ")).toLowerCase().includes(f.block.toLowerCase()))
      return false;
    if (f.minPrice != null && l.price < f.minPrice) return false;
    if (f.maxPrice != null && l.price > f.maxPrice) return false;
    if (f.beds && l.beds < f.beds) return false;
    if (f.baths && l.baths < f.baths) return false;
    if (f.verified && !l.verified) return false;
    if (f.featured && !l.featured) return false;
    // property size (normalised to sqft)
    if (f.size) {
      const sMin = sizeBandMin(f.size);
      const sMax = sizeBandMax(f.size);
      const sq = areaSqft(l);
      if (sq == null) return false;
      if (sMin != null && sq < sMin) return false;
      if (sMax != null && sq > sMax) return false;
    }
    if (f.feature && !(l.featureKeys ?? []).includes(f.feature)) return false;
    if (f.q) {
      const q = f.q.toLowerCase();
      const hay = `${l.title} ${l.headline ?? ""} ${l.areaLabel} ${l.cityName} ${l.subArea ?? ""} ${
        (l.locationPath ?? []).join(" ")
      } ${l.block ?? ""} ${l.sector ?? ""} ${l.phase ?? ""} ${l.plotNumber ?? ""} ${l.description} ${
        (l.features ?? []).join(" ")
      }`.toLowerCase();
      const hayHit = hay.includes(q);
      // property/plot-number lookup (e.g. "Plot 17", "house 22-B") matches the
      // listing's plotNumber even when prose/description don't mention it.
      const numHit = matchesPropertyNumber(l, f.q);
      // A number-only query must actually hit the property's number code —
      // guard against false positives from coincidental prose matches.
      if (isPropertyNumberQuery(f.q) && !numHit && !hay.includes(l.plotNumber?.toLowerCase() ?? "\u0000")) {
        return false;
      }
      if (!hayHit && !numHit) return false;
    }
    return true;
  }

  async getBySlug(slug: string): Promise<Listing | null> {
    const db = await loadDb();
    const l = db.listings.find((x) => x.slug === slug);
    return l && l.published !== false ? this.enrich(db, l) : null;
  }

  async getById(id: string): Promise<Listing | null> {
    const db = await loadDb();
    const l = db.listings.find((x) => x.id === id);
    return l && l.published !== false ? this.enrich(db, l) : null;
  }

  async getBySlugs(ids: string[]): Promise<Listing[]> {
    const db = await loadDb();
    return db.listings
      .filter((x) => x.published !== false && ids.includes(x.id))
      .map((l) => this.enrich(db, l));
  }

  async getFeatured(count = 6): Promise<Listing[]> {
    const db = await loadDb();
    return db.listings
      .filter((l) => l.published !== false && l.featured)
      .slice(0, count)
      .map((l) => this.enrich(db, l));
  }

  async getProjects(): Promise<Project[]> {
    const db = await loadDb();
    return db.projects;
  }

  async getCities(): Promise<CityOption[]> {
    const db = await loadDb();
    return db.cities;
  }

  /**
   * Similar properties, ranked on how close each candidate is on the vectors a
   * buyer cares about: property type, location (city + area), price band and
   * size (bed count). Returns the top `count`.
   */
  async getRelated(to: Listing, count = 3): Promise<Listing[]> {
    const db = await loadDb();
    const scored = db.listings
      .filter((l) => l.id !== to.id && l.published !== false)
      .map((l) => {
        let score = 0;
        if (l.kind === to.kind) score += 45;
        if (l.cityName === to.cityName) score += 20;
        if (l.areaLabel && l.areaLabel === to.areaLabel) score += 25;
        if (l.beds === to.beds && l.beds > 0) score += 10;
        if (l.purpose === to.purpose) score += 8;
        // price band proximity (within ~35% of the reference)
        if (to.price > 0 && l.price > 0) {
          const ratio = l.price / to.price;
          if (ratio >= 0.65 && ratio <= 1.35) score += 6 + Math.max(0, 8 - Math.abs(1 - ratio) * 10);
        }
        if (l.featured) score += 2;
        return { l, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map((x) => x.l);
    return scored.map((l) => this.enrich(db, l));
  }

  /** Derive display location from the tree. Never touches stored text fields. */
  private enrich(db: LocalDb, listing: Listing): Listing {
    const loc = locationForListing(db.locations, listing);
    const copy: Listing = { ...listing };
    copy.locationPath = loc.pathNames;
    copy.phase = loc.phase;
    copy.sector = loc.sector;
    copy.block = loc.block;
    if (loc.project) copy.project = { slug: slug(loc.project), name: loc.project };
    if (loc.city) copy.cityName = loc.city;
    // media: guarantee an ordered MediaItem[] (photo/floorplan/document/video/tour)
    copy.media = ensureMedia(copy);
    if (copy.media.some((m) => m.kind === "photo")) {
      copy.coverImage = coverOf(copy);
    }
    return copy;
  }
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** Recency value: missing `listedAt` means brand-new (sorts newest-first). */
function byListed(l: Listing): number {
  return l.listedAt ?? Number.MAX_SAFE_INTEGER;
}

/** Lightweight text-relevance score for keyword ranking. */
function relevance(l: Listing, q?: string): number {
  if (!q) return 0;
  const needle = q.toLowerCase();
  const title = l.title.toLowerCase();
  const area = `${l.areaLabel} ${l.cityName} ${(l.locationPath ?? []).join(" ")} ${l.block ?? ""} ${l.sector ?? ""} ${l.phase ?? ""} ${l.plotNumber ?? ""}`.toLowerCase();
  const desc = l.description.toLowerCase();
  // exact / strong property-number match always outranks incidental prose
  if (matchesPropertyNumber(l, q)) return 200;
  if (title.startsWith(needle)) return 120;
  if (title.includes(needle)) return 90;
  if (needle.split(/\s+/).every((w) => title.includes(w))) return 80;
  if (area.includes(needle)) return 50;
  if (desc.includes(needle)) return 20;
  return 0;
}
