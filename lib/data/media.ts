import type { Listing, MediaItem, MediaKind } from "./types";

/**
 * PROPERTY MEDIA helpers — a data-driven layer over a property's ordered
 * `MediaItem[]`. Keeps every consumer honest: nothing renders a hard-coded
 * array of asset URLs; it reads the property's media catalogue. Mirrors the
 * `property_media` SQL table (supabase/sql/property-media.sql).
 */

/** Intrinsic dims for the bundled placeholder images (avoid layout shift). */
const IMG_DIMS: Record<string, { w: number; h: number }> = {
  "/images/hero.jpg": { w: 1376, h: 768 },
  "/images/city-marquee.jpg": { w: 1376, h: 768 },
  "/images/apartment-tower.jpg": { w: 1200, h: 896 },
  "/images/bedroom-suite.jpg": { w: 1200, h: 896 },
  "/images/house-stone-grey.jpg": { w: 1200, h: 896 },
  "/images/interior-living.jpg": { w: 1200, h: 896 },
  "/images/society-aerial.jpg": { w: 1200, h: 896 },
  "/images/villa-modern-white.jpg": { w: 1200, h: 896 },
  "/media/floorplan-ground.png": { w: 1400, h: 1000 },
  "/media/floorplan-first.png": { w: 1400, h: 1000 },
};
const DEFAULT_DIMS = { w: 1200, h: 800 };

/** Look up known intrinsic dimensions for a (bundled) asset URL. */
export function assetDims(url: string): { w: number; h: number } {
  return IMG_DIMS[url] ?? DEFAULT_DIMS;
}

/** Readable file/basename for a URL (used for alt + document names). */
export function assetName(url: string): string {
  const clean = url.split(/[?#]/)[0];
  const base = clean.split("/").filter(Boolean).pop() ?? "asset";
  return base.replace(/[-_]+/g, " ").replace(/\.\w+$/, "");
}

function isImage(kind: MediaKind): boolean {
  return kind === "photo" || kind === "floorplan";
}

/** Stable ordering helper: covers first, then explicit `sort`. */
export function sortMedia<T extends Pick<MediaItem, "kind" | "sort" | "isCover">>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (isImage(a.kind) && isImage(b.kind)) {
      const ca = a.isCover ? 1 : 0;
      const cb = b.isCover ? 1 : 0;
      if (ca !== cb) return cb - ca;
    }
    return (a.sort ?? 0) - (b.sort ?? 0);
  });
}

/** Build a photo-only ordered list from plain gallery URLs (legacy fallback). */
export function photosFromGallery(gallery: string[], altBase = "Property photo"): MediaItem[] {
  return gallery.map((url, i) => ({
    kind: "photo",
    url,
    isCover: i === 0,
    sort: i,
    alt: `${altBase} — photo ${i + 1}`,
    width: assetDims(url).w,
    height: assetDims(url).h,
  }));
}

/**
 * Ensure a listing always exposes a full, ordered `media` catalogue. Older
 * records (or admin quick-entry) may only have gallery/cover + scalar URLs;
 * this folds those into MediaItems so the rest of the app can rely on `media`.
 */
export function ensureMedia(listing: Listing): MediaItem[] {
  if (Array.isArray(listing.media) && listing.media.length) {
    return sortMedia(listing.media);
  }
  const base = photosFromGallery(
    listing.gallery?.length ? listing.gallery : listing.coverImage ? [listing.coverImage] : [],
    listing.title ?? "Property",
  );
  const extras: MediaItem[] = [];
  const fp = listing.floorplanUrl;
  if (fp) {
    extras.push({
      kind: "floorplan", url: fp, sort: 0, name: "Floor plan",
      alt: `${listing.title ?? "Property"} floor plan`, width: assetDims(fp).w, height: assetDims(fp).h,
    });
  }
  if (listing.videoUrl) extras.push({ kind: "video", url: listing.videoUrl, sort: 0, name: "Walkthrough video" });
  if (listing.virtualTourUrl)
    extras.push({ kind: "virtual_tour", url: listing.virtualTourUrl, sort: 0, name: "Virtual tour" });
  return sortMedia([...base, ...extras]);
}

/** Ordered photo MediaItems of a listing (what the gallery renders). */
export function photosOf(listing: Listing): MediaItem[] {
  return ensureMedia(listing).filter((m) => m.kind === "photo");
}

/** The listing cover photo URL (first cover, else first photo). */
export function coverOf(listing: Listing): string {
  const p = photosOf(listing);
  return p.find((x) => x.isCover)?.url ?? p[0]?.url ?? listing.coverImage;
}

/** Split the full media catalogue into renderable groups. */
export function mediaGroups(listing: Listing) {
  const all = ensureMedia(listing);
  return {
    photos: all.filter((m) => m.kind === "photo"),
    floorplans: all.filter((m) => m.kind === "floorplan"),
    documents: all.filter((m) => m.kind === "document"),
    videos: all.filter((m) => m.kind === "video"),
    tours: all.filter((m) => m.kind === "virtual_tour"),
  };
}

/** Scalar admin inputs that fold into a full MediaItem[] catalogue. */
export interface MediaInputs {
  gallery: string[];
  floorplanUrl?: string;
  documents?: { url: string; name?: string }[];
  videoUrl?: string;
  virtualTourUrl?: string;
}

/** Build an ordered MediaItem[] from simple scalar inputs (admin quick-entry). */
export function buildMedia(i: MediaInputs): MediaItem[] {
  const base = photosFromGallery(i.gallery);
  const extras: MediaItem[] = [];
  const push = (m: Omit<MediaItem, "kind"> & { kind: MediaItem["kind"] }) => {
    m.sort = m.sort ?? extras.length;
    extras.push(m as MediaItem);
  };
  if (i.floorplanUrl) {
    const url = i.floorplanUrl.trim();
    push({ kind: "floorplan", url, name: "Floor plan", alt: "Floor plan", width: assetDims(url).w, height: assetDims(url).h });
  }
  for (const d of i.documents ?? []) {
    if (!d.url.trim()) continue;
    push({ kind: "document", url: d.url.trim(), name: d.name?.trim() || assetName(d.url) });
  }
  if (i.videoUrl?.trim()) push({ kind: "video", url: i.videoUrl.trim(), name: "Walkthrough video" });
  if (i.virtualTourUrl?.trim()) push({ kind: "virtual_tour", url: i.virtualTourUrl.trim(), name: "Virtual tour" });
  return sortMedia([...base, ...extras]);
}

/** Human label for a media kind (used in headings). */
export function kindLabel(kind: MediaKind): string {
  return (
    {
      photo: "Photos",
      floorplan: "Floor plans",
      document: "Documents",
      video: "Videos",
      virtual_tour: "Virtual tour",
    } as Record<MediaKind, string>
  )[kind];
}

/** Format bytes to a friendly file-size string (documents). */
export function formatBytes(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes, i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
