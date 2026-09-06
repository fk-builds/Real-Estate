import type { Store } from "./store";
import type {
  Listing,
  Project,
  CityOption,
  SearchFilters,
  SearchOptions,
  SearchResult,
} from "./types";
import { isPlotKind, type MediaItem } from "./types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";

/**
 * SupabaseStore — reads through the server/service-role client into PostgreSQL.
 *
 * Search is executed by the `manzil_search` PL/pgSQL function which uses
 * PostgreSQL full-text search over the generated `fts` vector plus partial
 * indexes (see docs/sql/search-function.sql). The returned JSON rows are
 * mapped here to our framework-agnostic `Listing` shape.
 */
export class SupabaseStore implements Store {
  readonly name = "supabase" as const;

  private get db() {
    const db = getSupabaseAdmin();
    if (!db) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
    return db;
  }

  async search(filters: SearchFilters, opts: SearchOptions = {}): Promise<SearchResult> {
    const { page = 1, pageSize = 12, sort = "newest" } = opts;
    const { data, error } = await this.db.rpc("manzil_search", {
      p_filters: {
        q: filters.q ?? null,
        purpose: filters.purpose ?? null,
        kind: filters.kind ?? null,
        city: filters.citySlug ?? null,
        area: filters.area ?? null,
        project: filters.project ?? null,
        min_price: filters.minPrice ?? null,
        max_price: filters.maxPrice ?? null,
        beds: filters.beds ?? null,
        baths: filters.baths ?? null,
        feature: filters.feature ?? null,
        verified: filters.verified === true ? true : null,
        featured: filters.featured === true ? true : null,
      },
      p_sort: sort,
      p_page: page,
      p_page_size: pageSize,
    });
    if (error) {
      console.error("SupabaseStore.search failed", error.message);
      return { items: [], total: 0, page, pageSize, totalPages: 0 };
    }
    const rows = (data ?? []) as Array<Record<string, unknown>>;
    return {
      items: rows.map(mapListingRow),
      total: Number(rows[0]?._total ?? rows.length),
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(Number(rows[0]?._total ?? rows.length) / pageSize)),
    };
  }

  async getBySlug(slug: string): Promise<Listing | null> {
    const { data, error } = await this.db
      .from("v_listing_search")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return mapListingRow(data as Record<string, unknown>);
  }

  async getById(id: string): Promise<Listing | null> {
    const { data, error } = await this.db
      .from("v_listing_search")
      .select("*")
      .eq("id", Number(id))
      .maybeSingle();
    if (error || !data) return null;
    return mapListingRow(data as Record<string, unknown>);
  }

  async getFeatured(count = 6): Promise<Listing[]> {
    const { data, error } = await this.db
      .from("v_listing_search")
      .select("*")
      .eq("is_featured", true)
      .limit(count);
    if (error) return [];
    return (data ?? []).map((r) => mapListingRow(r as Record<string, unknown>));
  }

  async getBySlugs(ids: string[]): Promise<Listing[]> {
    const numIds = ids.map((i) => Number(i)).filter((n) => Number.isFinite(n));
    if (!numIds.length) return [];
    const { data, error } = await this.db
      .from("v_listing_search")
      .select("*")
      .in("id", numIds);
    if (error) return [];
    return (data ?? []).map((r) => mapListingRow(r as Record<string, unknown>));
  }

  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.db
      .from("projects")
      .select("*")
      .order("is_featured", { ascending: false });
    if (error) return [];
    return (data ?? []).map(mapProjectRow);
  }

  async getCities(): Promise<CityOption[]> {
    const { data, error } = await this.db
      .from("cities")
      .select("slug,name,listing_count")
      .order("listing_count", { ascending: false });
    if (error) return [];
    return (data ?? []).map((r) => ({
      slug: r.slug,
      name: r.name,
      listings: Number(r.listing_count ?? 0),
    }));
  }

  async getRelated(to: Listing, count = 3): Promise<Listing[]> {
    const { data, error } = await this.db
      .from("v_listing_search")
      .select("*")
      .eq("kind", to.kind)
      .neq("id", Number(to.id))
      .limit(count);
    if (error) return [];
    return (data ?? []).map((r) => mapListingRow(r as Record<string, unknown>));
  }
}

/* ------------------------------ mappers ------------------------------ */

function mapListingRow(r: Record<string, unknown>): Listing {
  const price = Number(r.price ?? 0);
  const period = r.price_period === "monthly" ? "monthly" : "one_time";
  const kind = (r.kind ?? "house") as Listing["kind"];
  return {
    id: String(r.id),
    slug: String(r.slug ?? r.id),
    title: String(r.title ?? "Property"),
    headline: r.headline ? String(r.headline) : undefined,
    description: String(r.description ?? ""),
    purpose: (r.purpose ?? "sale") as Listing["purpose"],
    kind,
    tagKind: r.tag ? (String(r.tag) as Listing["tagKind"]) : ((r.purpose ?? "sale") as Listing["tagKind"]),
    tagLabel: r.tag ? String(r.tag).toUpperCase() : undefined,
    verified: Boolean(r.verified),
    featured: Boolean(r.is_featured),
    isNew: Boolean(r.is_new),
    views: Number(r.views ?? 0),
    price,
    pricePeriod: period,
    priceDisplay: formatPrice(price, { period, unit: isPlotKind(kind) ? "per marla" : null }),
    status: (r.status ?? "available") as Listing["status"],
    areaRaw: String(r.area_raw ?? ""),
    beds: Number(r.beds ?? 0),
    baths: Number(r.baths ?? 0),
    citySlug: String(r.city_slug ?? ""),
    cityName: String(r.city_name ?? ""),
    areaLabel: String(r.area_label ?? ""),
    subArea: r.subarea_label ? String(r.subarea_label) : undefined,
    project: r.project_slug ? { slug: String(r.project_slug), name: String(r.project_name) } : undefined,
    coverImage: String(r.cover_image ?? "/images/hero.jpg"),
    gallery: Array.isArray(r.gallery) ? r.gallery.map(String) : [String(r.cover_image ?? "/images/hero.jpg")],
    features: Array.isArray(r.features) ? r.features.map(String) : [],
    featureKeys: Array.isArray(r.feature_keys) ? r.feature_keys.map(String) : undefined,
    postedLabel: String(r.posted_label ?? ""),
    media: Array.isArray(r.media) ? (r.media as MediaItem[]) : undefined,
    floorplanUrl: (Array.isArray(r.media)
      ? (r.media as MediaItem[]).find((m) => m.kind === "floorplan")?.url
      : undefined),
  };
}

function mapProjectRow(r: Record<string, unknown>): Project {
  const images = Array.isArray(r.images) ? (r.images as string[]) : [];
  return {
    id: String(r.id),
    slug: String(r.slug ?? r.id),
    name: String(r.name),
    category: r.category ? String(r.category) : undefined,
    status: r.status ? String(r.status) : undefined,
    location: String(r.location ?? ""),
    priceFrom: formatPrice(Number(r.min_price ?? 0)),
    units: String(r.units ?? ""),
    image: images[0] ?? "/images/society-aerial.jpg",
    description: String(r.description ?? ""),
    featured: Boolean(r.is_featured),
  };
}
