/**
 * Domain types — framework-agnostic. UI components depend on these types only,
 * never on Supabase/Meilisearch/S3 types directly. This is what makes the
 * storage & search providers swappable.
 */

/** One level of the relational property-location hierarchy. */
export type LocationLevel =
  | "country"
  | "province"
  | "city"
  | "area"
  | "project"
  | "phase"
  | "sector"
  | "block";

/**
 * A node in the location tree (Pakistan → Province → City → Area → Project →
 * Phase → Sector → Block). Relational parent-child, mirroring the SQL table.
 */
export interface LocationNode {
  id: string;
  parentId: string | null;
  level: LocationLevel;
  name: string;
  /** short code where relevant, e.g. plot/block codes */
  slug: string;
}

export const LOCATION_LEVEL_ORDER: LocationLevel[] = [
  "country", "province", "city", "area", "project", "phase", "sector", "block",
];

/** A property asset kind — see the `property_media` table (media_kind). */
export type MediaKind = "photo" | "floorplan" | "document" | "video" | "virtual_tour";

export const MEDIA_KINDS: MediaKind[] = [
  "photo", "floorplan", "document", "video", "virtual_tour",
];

/**
 * One row of the `property_media` table. A property owns MANY media items.
 * The UI renders from these (ordered by `sort`), never from hard-coded arrays.
 */
export interface MediaItem {
  kind: MediaKind;
  /** storage ref OR full http(s) URL (same value written to property_media.ref) */
  url: string;
  /** resolved display URL (http or public-bucket path) */
  // (kept minimal: ref storage shape lives in media-service)
  /** poster/thumbnail image for a video or social card */
  thumb?: string;
  /** exactly one photo per property should be the cover */
  isCover?: boolean;
  /** explicit ordering within the property (defaults to array order) */
  sort?: number;
  /** short human caption shown beneath the asset */
  caption?: string;
  /** accessibility / SEO alt text (images & floorplans) */
  alt?: string;
  /** original filename / display name (documents, floorplans) */
  name?: string;
  /** intrinsic pixel dimensions — lets <Image> reserve space (no layout shift) */
  width?: number;
  height?: number;
  /** mime type + size (documents) */
  contentType?: string;
  size?: number;
}

export type PropertyPurpose = "sale" | "rent" | "lease";

/** Listing type displayed: For Sale / For Rent / For Lease */
export const PURPOSE_LABELS: Record<PropertyPurpose, string> = {
  sale: "For Sale",
  rent: "For Rent",
  lease: "For Lease",
};

/** Property status (admin-driven lifecycle). */
export type PropertyStatus =
  | "available"
  | "sold"
  | "rented"
  | "reserved"
  | "under_offer"
  | "pending_verification"
  | "draft";

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "Available",
  sold: "Sold",
  rented: "Rented",
  reserved: "Reserved",
  under_offer: "Under Offer",
  pending_verification: "Pending Verification",
  draft: "Draft",
};

/** Statuses that are browsable/live on the public site. */
export const LIVE_STATUSES: PropertyStatus[] = ["available", "under_offer", "reserved"];

/** Returns true for plot/land kinds (use plot sizing + per-marla pricing). */
export function isPlotKind(kind: PropertyKind): boolean {
  return kind === "residential-plot" || kind === "commercial-plot" || kind === "agricultural-land";
}
export function isLandLike(kind: PropertyKind): boolean {
  return isPlotKind(kind) || kind === "farmhouse";
}

export type PropertyKind =
  | "residential-plot"
  | "commercial-plot"
  | "house"
  | "villa"
  | "apartment"
  | "flat"
  | "penthouse"
  | "office"
  | "shop"
  | "plaza"
  | "farmhouse"
  | "agricultural-land"
  | "warehouse"
  | "building"
  | "industrial"
  | "other";

export interface Listing {
  id: string;
  slug: string;
  title: string;
  headline?: string;
  description: string;
  purpose: PropertyPurpose;
  kind: PropertyKind;
  /** admin lifecycle status (see STATUS_LABELS) */
  status?: PropertyStatus;
  /** displayed tag category e.g. sale/rent/lease/new/hot */
  tagKind?: "sale" | "rent" | "lease" | "new" | "hot";
  tagLabel?: string;
  verified: boolean;
  featured: boolean;
  isNew: boolean;
  views: number;
  /** epoch ms the listing was created/listed (drives Newest / Oldest sort) */
  listedAt?: number;

  price: number;
  pricePeriod?: "one_time" | "monthly";
  priceDisplay: string;
  /** how the price is quoted (total / per marla / per kanal / per sqft / monthly) */
  priceUnit?: "pkr_total" | "pkr_per_marla" | "pkr_per_kanal" | "pkr_per_sqft" | "pkr_per_sqyd" | "per_month";
  /** ISO currency, PKR default */
  currency?: string;

  areaRaw: string; // "8,600 sqft" | "1 Kanal" | "500 sq yd"
  beds: number;
  baths: number;
  /** base numeric area + unit (kept when available) */
  areaNumber?: number;
  areaUnit?: string;
  floors?: number;
  years?: number;
  /** build/condition/lifecycle */
  constructionYear?: number;
  furnishingStatus?: "unfurnished" | "partially_furnished" | "furnished";
  possessionStatus?: string;
  developmentStatus?: string;
  /** addressing (not the hierarchy) */
  propertyNumber?: string;
  street?: string;
  latitude?: number;
  longitude?: number;

  citySlug: string;
  cityName: string;
  areaLabel: string; // "DHA Phase 8"
  subArea?: string;
  project?: { slug: string; name: string };

  /**
   * FK to the deepest applicable node in the location tree. The display fields
   * below are DERIVED by the store from the tree — never the stored source of
   * the hierarchy (that is the node tree / relational tables).
   */
  locationId?: string;
  /** derived from the tree (for search/display); not authoritative */
  locationPath?: string[];
  /** society/phase/sector/block drill-down labels (derived from tree) */
  phase?: string;
  sector?: string;
  block?: string;
  /** e.g. "Plot 12-C" — surfaced for land listings */
  plotNumber?: string;

  /**
   * cover photo (first photo in `media` by default). Denormalised for list/card
   * views; `media` is the authoritative detailed collection.
   */
  coverImage: string;
  /** ordered photo URLs (subset of media for legacy card/list rendering) */
  gallery: string[];
  /**
   * The authoritative, ordered media collection (photos + floorplans +
   * documents + video + virtual tour). Backed by the `property_media` table.
   * When absent (older records) it is derived from gallery/coverImage on load.
   */
  media?: MediaItem[];
  /** free-form descriptive notes (optional extras) */
  features: string[];
  /** selected feature-tag keys (relational to the feature dictionary) */
  featureKeys?: string[];
  postedLabel: string;

  /** admin control — hidden from the public site when false */
  published?: boolean;
  /** deprecated floor plan shortcut (superseded by media kind='floorplan') */
  floorplanUrl?: string;
  /** convenience URL mirrors (written into media as kind='video' / 'virtual_tour') */
  videoUrl?: string;
  virtualTourUrl?: string;
  /**
   * Flexible, property-specific attributes (JSONB in Postgres). Only the fields
   * that actually apply to this property live here — a plot never carries
   * apartment-only fields, etc. Mirrors the `attributes` jsonb column.
   */
  attributes?: Record<string, string | number | boolean>;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  category?: string;
  status?: string; // pre_launch | booking | possession | sold_out
  location: string;
  priceFrom: string;
  priceFromNumber?: number;
  units: string;
  image: string;
  description: string;
  featured: boolean;
}

export interface CityOption {
  slug: string;
  name: string;
  listings: number;
}

export interface SearchFilters {
  /** free keyword across title/headline/location/description */
  q?: string;
  /** sale | rent | lease (alias URL param: listing) */
  purpose?: PropertyPurpose;
  /** property type (alias URL param: type) */
  kind?: PropertyKind;
  /** city slug (alias URL param: city) */
  citySlug?: string;
  /** area / neighbourhood label, e.g. "DHA Phase 8" */
  area?: string;
  /** society/project name or slug */
  project?: string;
  /** phase (e.g. "Phase 7") */
  phase?: string;
  /** sector */
  sector?: string;
  /** block */
  block?: string;
  minPrice?: number;
  maxPrice?: number;
  /** minimum bedrooms */
  beds?: number;
  /** minimum bathrooms */
  baths?: number;
  /** size band key (see SIZE_BANDS) — property size */
  size?: string;
  /** single required feature-tag key */
  feature?: string;
  /** only title-verified listings */
  verified?: boolean;
  /** only featured listings */
  featured?: boolean;
  status?: PropertyStatus;
}

/** Approx sqft conversions (1 marla ≈ 272.25 sqft, 1 kanal = 20 marla). */
export const UNIT_SQFT: Record<string, number> = {
  sqft: 1, sqm: 10.764, sqyd: 9, marla: 272.25, kanal: 5445, acre: 43560,
};

/** Return a listing's area normalised to sqft (when a numeric area + unit exist). */
export function areaSqft(l: Listing): number | undefined {
  const n = l.areaNumber;
  const u = l.areaUnit;
  if (!n || !u) return undefined;
  const f = UNIT_SQFT[u.toLowerCase()];
  return f ? n * f : undefined;
}

/** Size-band presets exposed to the filter UI (mapped to sqft ranges). */
export const SIZE_BANDS: Array<{ v: string; label: string; min?: number; max?: number }> = [
  { v: "", label: "Any size" },
  { v: "under-5-marla", label: "Under 5 Marla", max: 5 * 272.25 },
  { v: "5-10-marla", label: "5–10 Marla", min: 5 * 272.25, max: 10 * 272.25 },
  { v: "10m-1k", label: "10 Marla – 1 Kanal", min: 10 * 272.25, max: 5445 },
  { v: "1-2-kanal", label: "1–2 Kanal", min: 5445, max: 2 * 5445 },
  { v: "2-plus-kanal", label: "2 Kanal +", min: 2 * 5445 },
];

export function sizeBandMin(v: string): number | undefined {
  return SIZE_BANDS.find((b) => b.v === v)?.min;
}
export function sizeBandMax(v: string): number | undefined {
  return SIZE_BANDS.find((b) => b.v === v)?.max;
}

/** Sort modes the search supports. */
export type SortMode =
  | "newest"      // latest listed first
  | "oldest"      // earliest listed first
  | "price_asc"   // price low → high
  | "price_desc"  // price high → low
  | "views"       // most viewed first
  | "featured"    // featured listings first (then newest)
  | "relevance";  // best text/keyword match (falls back to newest)

export interface SearchOptions {
  page?: number;
  pageSize?: number;
  sort?: SortMode;
}

export interface SearchResult {
  items: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
