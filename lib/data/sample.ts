import type { Listing, Project, CityOption, MediaItem } from "./types";
import { formatPrice } from "@/lib/utils";
import { photosFromGallery } from "./media";

const img = (p: string) => `/images/${p}`;

const T = (
  o: Partial<Listing> & Pick<Listing, "id" | "slug" | "title" | "price">,
): Listing => {
  const purpose = o.purpose ?? "sale";
  const period = o.pricePeriod ?? "one_time";
  const cover = o.coverImage ?? img("hero.jpg");
  const verb = purpose === "rent" ? "rent" : purpose === "lease" ? "lease" : "sale";
  const base: Listing = {
    ...o,
    id: o.id,
    slug: o.slug,
    title: o.title,
    price: o.price,
    purpose,
    kind: o.kind ?? "house",
    currency: o.currency ?? "PKR",
    priceUnit: o.priceUnit ?? (period === "monthly" ? "per_month" : "pkr_total"),
    status: o.status ?? "available",
    description:
      o.description ??
      `${o.title} is offered for ${verb} in ${o.cityName ?? "a prime location"}. Title-verified by Manzil's legal desk with clear possession and active utilities. Negotiable with clean paperwork and quick transfer assistance.`,
    verified: o.verified ?? true,
    featured: o.featured ?? false,
    isNew: o.isNew ?? false,
    views: o.views ?? 0,
    pricePeriod: period,
    priceDisplay: formatPrice(o.price, { period, unit: period === "monthly" ? "monthly" : null }),
    beds: o.beds ?? 0,
    baths: o.baths ?? 0,
    tagKind: o.tagKind ?? (purpose === "rent" ? "rent" : purpose === "lease" ? "lease" : "sale"),
    citySlug: o.citySlug ?? "lahore",
    cityName: o.cityName ?? "Lahore",
    areaLabel: o.areaLabel ?? "Prime Location",
    coverImage: cover,
    gallery: o.gallery ?? [cover, img("interior-living.jpg"), img("bedroom-suite.jpg")],
    features: o.features ?? ["Ownership & title verified", "Boundary wall & gate", "Active utilities"],
    postedLabel: o.postedLabel ?? "Today",
    areaRaw: o.areaRaw ?? "",
    published: o.published ?? true,
  };
  return base;
};

export const SAMPLE_LISTINGS: Listing[] = [
  T({
    id: "1", slug: "modern-luxury-villa-dha-phase-8-lahore",
    title: "1 Kanal Modern Luxury Villa, DHA Phase 8",
    headline: "Newly built contemporary villa",
    kind: "house", areaLabel: "DHA Phase 8", citySlug: "lahore", cityName: "Lahore",
    subArea: "Block J", price: 145000000, featured: true, tagKind: "sale", tagLabel: "FEATURED",
    beds: 5, baths: 7, areaRaw: "8,600 sqft", views: 1240, isNew: true,
    coverImage: img("hero.jpg"),
    features: ["1 Kanal covered house", "Boundary wall & gate", "Solar-ready wiring", "Ownership & title verified", "Bore + main water", "Corner plot, 30ft road", "Lift / internal staircase", "Backyard lawn"],
    description:
      "An exquisite 1-Kanal contemporary villa set in the most coveted block of DHA Phase 8, Lahore. Triple-height lounge, marble finishes, smart home wiring, five ensuite bedrooms and a landscaped private courtyard. Steps from the central park and the Phase 8 commercial strip. Full title verification completed by Manzil's legal desk.",
  }),
  T({
    id: "2", slug: "10-marla-family-home-bahria-town-rawalpindi",
    title: "10 Marla Family Home, Bahria Town",
    kind: "house", areaLabel: "Bahria Town", citySlug: "rawalpindi", cityName: "Rawalpindi",
    subArea: "Phase 7", price: 72000000, tagKind: "new", tagLabel: "NEW",
    beds: 4, baths: 5, areaRaw: "4,200 sqft", views: 860,
    coverImage: img("villa-modern-white.jpg"),
  }),
  T({
    id: "3", slug: "boutique-stone-glass-villa-gulberg-greens",
    title: "Boutique Stone & Glass Villa, Gulberg Greens",
    kind: "house", areaLabel: "Gulberg Greens", citySlug: "islamabad", cityName: "Islamabad",
    subArea: "Sector A", price: 98000000, tagKind: "sale", tagLabel: "EXCLUSIVE",
    beds: 5, baths: 6, areaRaw: "6,100 sqft", views: 720, featured: true,
    coverImage: img("house-stone-grey.jpg"),
  }),
  T({
    id: "4", slug: "3-bed-luxury-apartment-skyline-tower-gulberg",
    title: "3-Bed Luxury Apartment, Skyline Tower",
    kind: "apartment", purpose: "rent", pricePeriod: "monthly",
    areaLabel: "Gulberg", citySlug: "lahore", cityName: "Lahore", subArea: "MM Alam Rd",
    price: 320000, tagKind: "rent", tagLabel: "HOT", beds: 3, baths: 4,
    areaRaw: "2,450 sqft", views: 1580, isNew: true,
    coverImage: img("apartment-tower.jpg"),
  }),
  T({
    id: "5", slug: "500-sqyd-plot-eco-heights-g15-islamabad",
    title: "500 Sq Yd Residential Plot, Eco Heights G-15",
    kind: "residential-plot", areaLabel: "Eco Heights", citySlug: "islamabad", cityName: "Islamabad",
    subArea: "G-15", price: 24000000, tagKind: "new", tagLabel: "INVESTOR PICK",
    areaRaw: "500 sq yd", views: 640,
    coverImage: img("society-aerial.jpg"),
    features: ["NOC verified (CDA)", "Corner, park-facing", "File/possession clear", "Registered transfer", "3-year installment plan"],
  }),
  T({
    id: "6", slug: "designer-villa-f7-islamabad",
    title: "Designer Villa, F-7 Markaz",
    kind: "house", areaLabel: "F-7", citySlug: "islamabad", cityName: "Islamabad",
    subArea: "F-7/3", price: 119000000, tagKind: "sale", tagLabel: "LUXURY",
    beds: 4, baths: 6, areaRaw: "5,800 sqft", views: 990, featured: true,
    coverImage: img("bedroom-suite.jpg"),
  }),
  T({
    id: "7", slug: "penthouse-seaview-clifton-karachi",
    title: "Sea-View Penthouse, Clifton",
    kind: "penthouse", purpose: "rent", pricePeriod: "monthly",
    areaLabel: "Clifton", citySlug: "karachi", cityName: "Karachi",
    price: 750000, tagKind: "rent", tagLabel: "HOT", beds: 4, baths: 5,
    areaRaw: "5,200 sqft", views: 1100,
    coverImage: img("apartment-tower.jpg"),
  }),
  T({
    id: "8", slug: "1-kanal-corner-villa-bahria-town-rawalpindi",
    title: "1 Kanal Corner Villa, Bahria Town",
    kind: "house", areaLabel: "Bahria Town", citySlug: "rawalpindi", cityName: "Rawalpindi",
    subArea: "Phase 8 · Sector E", price: 210000000, tagKind: "sale", tagLabel: "FEATURED",
    beds: 6, baths: 8, areaRaw: "1 Kanal", views: 810, featured: true,
    coverImage: img("city-marquee.jpg"),
  }),
  T({
    id: "9", slug: "10-marla-plots-bahria-town-karachi",
    title: "10 Marla Corner Plots, Bahria Town Karachi",
    kind: "residential-plot", areaLabel: "Bahria Town", citySlug: "karachi", cityName: "Karachi",
    subArea: "Precinct 19", price: 35000000, tagKind: "new", tagLabel: "PRE-LAUNCH",
    areaRaw: "10 Marla", views: 430,
    coverImage: img("society-aerial.jpg"),
  }),
  T({
    id: "10", slug: "modern-5-marla-house-dha-phase-6-lahore",
    title: "5 Marla Modern House, DHA Phase 6 Block A",
    headline: "Freshly built family home in a settled block",
    kind: "house", areaLabel: "DHA Phase 6", citySlug: "lahore", cityName: "Lahore",
    subArea: "Sector A · Block A", locationId: "dha-ph6-sec-a-blk-a", plotNumber: "House 22-B",
    price: 42000000, tagKind: "new", tagLabel: "NEW", beds: 3, baths: 4,
    areaRaw: "2,900 sqft", views: 540, isNew: true, latitude: 31.4332, longitude: 74.4095,
    coverImage: img("villa-modern-white.jpg"),
    features: ["5 Marla covered house", "Boundary wall & gate", "Ownership & title verified", "Fully developed block", "Park-facing street", "Solar-ready wiring"],
    description:
      "A smartly designed 5-Marla modern house in the mature and most-settled Phase 6 of DHA Lahore — fully developed block, wide street and complete title verification handled by Manzil. Minutes from DHA's commercial zones and the phase's parks.",
  }),
  T({
    id: "11", slug: "5-marla-residential-plot-dha-phase-6-lahore",
    title: "5 Marla Residential Plot, DHA Phase 6 Block B",
    headline: "Corner plot in a settled Phase 6 block",
    kind: "residential-plot", areaLabel: "DHA Phase 6", citySlug: "lahore", cityName: "Lahore",
    subArea: "Sector A · Block B", locationId: "dha-ph6-sec-a-blk-b", plotNumber: "Plot 17 (corner)",
    price: 26000000, tagKind: "sale", tagLabel: "INVESTOR PICK", areaRaw: "5 Marla", views: 470,
    latitude: 31.4341, longitude: 74.4112,
    coverImage: img("society-aerial.jpg"),
    features: ["Corner, park-facing", "Clear DHA file/possession", "Registered transfer", "Active utilities at plot line", "Resale & rental demand"],
    description:
      "A premium corner 5-Marla plot in settled DHA Phase 6, Sector A Block B — one of DHA's most liquid markets for build-to-live and investment. Clear title with transfer arranged by Manzil.",
  }),
];

// ---------------------------------------------------------------------------
// Location-hierarchy enrichment: phase / sector / block / plot numbers used by
// the drill-down browsing pages and surfaced on land listings.
// ---------------------------------------------------------------------------
{
  const enrich: Record<string, Partial<Listing>> = {
    "modern-luxury-villa-dha-phase-8-lahore": {
      locationId: "dha-ph8-blk-j", plotNumber: "House 12-A",
    },
    "10-marla-family-home-bahria-town-rawalpindi": {
      locationId: "bahria-p7-blk-c", plotNumber: "Plot 45", status: "under_offer",
    },
    "boutique-stone-glass-villa-gulberg-greens": {
      locationId: "gulberg-greens",
    },
    "3-bed-luxury-apartment-skyline-tower-gulberg": {
      locationId: "gulberg-mmalam", plotNumber: "Apt 2103",
    },
    "500-sqyd-plot-eco-heights-g15-islamabad": {
      locationId: "eco-h-sg", plotNumber: "Plot 12-C",
    },
    "designer-villa-f7-islamabad": {
      locationId: "f7", plotNumber: "Street 25",
    },
    "penthouse-seaview-clifton-karachi": {
      locationId: "clifton-blk4", plotNumber: "Penthouse 9-A",
    },
    "1-kanal-corner-villa-bahria-town-rawalpindi": {
      locationId: "bahria-p8-se",
    },
    "10-marla-plots-bahria-town-karachi": {
      locationId: "bahria-khi-p19", plotNumber: "Plot 41 & 42 (corner)",
    },
  };
  for (const l of SAMPLE_LISTINGS) Object.assign(l, enrich[l.slug] ?? {});
}

// ---------------------------------------------------------------------------
// Property-specific detail enrichment (flexible `attributes` + shared fields).
// Only the facts that apply to each kind are present — never irrelevant ones.
// ---------------------------------------------------------------------------
{
  const extra: Record<string, Partial<Listing>> = {
    "modern-luxury-villa-dha-phase-8-lahore": {
      areaUnit: "sqft", areaNumber: 8600,
      floors: 2, constructionYear: 2024, furnishingStatus: "unfurnished",
      possessionStatus: "ready", street: "Street 25", latitude: 31.4287, longitude: 74.3987,
      attributes: { carPorch: 2, solarReady: true, internalLift: true, garage: 2 },
    },
    "10-marla-family-home-bahria-town-rawalpindi": {
      areaUnit: "sqft", areaNumber: 4200,
      floors: 2, constructionYear: 2021, furnishingStatus: "partially_furnished",
      possessionStatus: "ready", street: "Phase 7 Main Blvd", latitude: 33.572, longitude: 73.052,
      attributes: { carPorch: 1, boundaryWall: true },
    },
    "boutique-stone-glass-villa-gulberg-greens": {
      areaUnit: "sqft", areaNumber: 6100, floors: 2, constructionYear: 2023,
      possessionStatus: "ready", latitude: 33.694, longitude: 73.065,
      attributes: { carPorch: 2, boundaryWall: true },
    },
    "3-bed-luxury-apartment-skyline-tower-gulberg": {
      areaUnit: "sqft", areaNumber: 2450,
      floors: 1, constructionYear: 2023, furnishingStatus: "furnished",
      possessionStatus: "ready", latitude: 31.506, longitude: 74.345,
      attributes: { floorLevel: 12, hasLift: true, parkingBays: 1, isCorner: false },
    },
    "500-sqyd-plot-eco-heights-g15-islamabad": {
      areaUnit: "sqyd", areaNumber: 500, developmentStatus: "under_development",
      possessionStatus: "balloting_done", latitude: 33.64, longitude: 72.98,
      attributes: { facing: "Park", cornerPlot: true, installmentYears: 3 },
    },
    "designer-villa-f7-islamabad": {
      areaUnit: "sqft", areaNumber: 5800,
      floors: 2, constructionYear: 2022, furnishingStatus: "unfurnished",
      possessionStatus: "ready", street: "Street 25, F-7/3", latitude: 33.718, longitude: 73.041,
      attributes: { carPorch: 2, solarReady: true },
    },
    "penthouse-seaview-clifton-karachi": {
      areaUnit: "sqft", areaNumber: 5200, floors: 3, possessionStatus: "ready",
      latitude: 24.824, longitude: 67.033,
      attributes: { hasLift: true, parkingBays: 2, isCorner: false },
    },
    "1-kanal-corner-villa-bahria-town-rawalpindi": {
      areaUnit: "kanal", areaNumber: 1,
      floors: 2, constructionYear: 2020, furnishingStatus: "unfurnished",
      possessionStatus: "ready", latitude: 33.565, longitude: 73.095,
      attributes: { carPorch: 2, garage: 2, boundaryWall: true },
    },
    "10-marla-plots-bahria-town-karachi": {
      areaUnit: "marla", areaNumber: 10, developmentStatus: "under_development",
      possessionStatus: "balloting_done", latitude: 24.986, longitude: 67.14,
      attributes: { cornerPlot: true },
    },
  };
  for (const l of SAMPLE_LISTINGS) Object.assign(l, extra[l.slug] ?? {});
}

// Listing recency (drives Newest / Oldest sort). Descending → earlier entry
// is the most recently listed.
{
  const base = 1788220800000; // ~2026-09-01 UTC
  SAMPLE_LISTINGS.forEach((l, i) => {
    l.listedAt = base - i * 2 * 86_400_000;
  });
}

// ---------------------------------------------------------------------------
// PROPERTY MEDIA seeds — a data-driven, ordered MediaItem[] per listing backed
// by the `property_media` table. Photos carry cover flag + captions + alt;
// floorplans/documents/video/virtual-tour are separate media rows. Listings
// without an explicit list fall back to photos built from their gallery.
// The video/virtual-tour URLs below are DEMO placeholders (replaced by real
// uploads/embeds in production).
// ---------------------------------------------------------------------------
const PHOTO_CAPTIONS = [
  "Front elevation", "Living & lounge area", "Bedroom", "Interior detail", "Outdoor & context",
];
function demoPhotos(listing: Listing): MediaItem[] {
  const urls = listing.gallery.length ? listing.gallery : [listing.coverImage];
  return urls.map((url, i) => {
    const caption = PHOTO_CAPTIONS[i] ?? `Photo ${i + 1}`;
    return {
      kind: "photo", url, isCover: i === 0, sort: i,
      caption, alt: `${listing.title} — ${caption.toLowerCase()}`,
    };
  });
}
{
  const rich: Record<string, MediaItem[]> = {
    "modern-luxury-villa-dha-phase-8-lahore": [
      { kind: "photo", url: img("hero.jpg"), isCover: true, sort: 0,
        caption: "Front elevation — corner villa on a 30-ft road", alt: "Front elevation of a 1 Kanal modern luxury villa in DHA Phase 8" },
      { kind: "photo", url: img("interior-living.jpg"), sort: 1,
        caption: "Double-height lounge with marble finishes", alt: "Double-height lounge interior" },
      { kind: "photo", url: img("bedroom-suite.jpg"), sort: 2,
        caption: "En-suite master bedroom", alt: "En-suite master bedroom interior" },
      { kind: "photo", url: img("villa-modern-white.jpg"), sort: 3,
        caption: "Side & rear garden elevation", alt: "Rear garden elevation of the villa" },
      { kind: "photo", url: img("city-marquee.jpg"), sort: 4,
        caption: "Community & location context", alt: "Aerial context of the DHA Phase 8 community" },
      { kind: "floorplan", url: "/media/floorplan-ground.png", sort: 0,
        name: "Ground floor plan", caption: "Ground floor layout", alt: "Ground floor plan" },
      { kind: "floorplan", url: "/media/floorplan-first.png", sort: 1,
        name: "First floor plan", caption: "First floor layout", alt: "First floor plan" },
      { kind: "document", url: "/media/property-dossier.pdf", sort: 0,
        name: "Property dossier.pdf", caption: "Full title-verified dossier", contentType: "application/pdf", size: 115201 },
      { kind: "video", url: "https://www.youtube.com/embed/jNQXAC9IVRw", sort: 0,
        name: "Walkthrough video", caption: "Live 3-min walkthrough" },
      { kind: "virtual_tour", url: "https://my.matterport.com/show/?m=DEMO-8PHASE", sort: 0,
        name: "3D virtual tour", caption: "Explore the whole property in 3D" },
    ],
    "penthouse-seaview-clifton-karachi": [
      { kind: "photo", url: img("apartment-tower.jpg"), isCover: true, sort: 0,
        caption: "Sea-view penthouse", alt: "Sea-view penthouse in Clifton" },
      { kind: "photo", url: img("city-marquee.jpg"), sort: 1,
        caption: "Skyline & sea view terrace", alt: "Skyline and sea view from the penthouse terrace" },
      { kind: "photo", url: img("bedroom-suite.jpg"), sort: 2,
        caption: "En-suite bedroom", alt: "En-suite bedroom in the penthouse" },
      { kind: "video", url: "https://www.youtube.com/embed/jNQXAC9IVRw", sort: 0,
        name: "Terrace walkthrough", caption: "Views from the terrace" },
      { kind: "virtual_tour", url: "https://my.matterport.com/show/?m=DEMO-SEAVIEW", sort: 0,
        name: "3D virtual tour", caption: "Explore the penthouse in 3D" },
    ],
    "500-sqyd-plot-eco-heights-g15-islamabad": [
      { kind: "photo", url: img("society-aerial.jpg"), isCover: true, sort: 0,
        caption: "Plot site within Eco Heights", alt: "Aerial view of the residential plot site in Eco Heights G-15" },
      { kind: "photo", url: img("city-marquee.jpg"), sort: 1,
        caption: "Master plan context", alt: "Master plan context of Eco Heights" },
      { kind: "document", url: "/media/property-dossier.pdf", sort: 0,
        name: "Plot file & NOC.pdf", caption: "NOC verified (CDA)", contentType: "application/pdf", size: 115201 },
    ],
  };
  for (const l of SAMPLE_LISTINGS) {
    l.media = rich[l.slug] ?? demoPhotos(l);
  }
}

// ---------------------------------------------------------------------------
// Feature-tag seeds: each listing selects feature KEYS from the shared
// dictionary (lib/data/features.ts). Never free text — tags are relational.
// ---------------------------------------------------------------------------
{
  const tags: Record<string, string[]> = {
    "modern-luxury-villa-dha-phase-8-lahore": [
      "electricity", "gas", "water", "sewerage", "boundary-wall", "security", "cctv", "parking",
      "servant-quarter", "park-facing", "corner", "gym",
    ],
    "10-marla-family-home-bahria-town-rawalpindi": [
      "electricity", "gas", "water", "boundary-wall", "parking", "security", "mosque", "park",
    ],
    "boutique-stone-glass-villa-gulberg-greens": [
      "electricity", "water", "gas", "boundary-wall", "parking", "security", "cctv", "park",
    ],
    "3-bed-luxury-apartment-skyline-tower-gulberg": [
      "electricity", "water", "gas", "security", "cctv", "gym", "swimming-pool", "furnished", "parking", "main-boulevard",
    ],
    "500-sqyd-plot-eco-heights-g15-islamabad": [
      "electricity", "gas", "water", "sewerage", "boundary-wall", "park-facing", "corner", "park", "mosque", "school-nearby",
    ],
    "designer-villa-f7-islamabad": [
      "electricity", "gas", "water", "sewerage", "boundary-wall", "security", "cctv", "parking", "hospital-nearby", "main-road",
    ],
    "penthouse-seaview-clifton-karachi": [
      "electricity", "water", "gas", "security", "parking", "gym", "swimming-pool", "furnished", "roof-access",
    ],
    "1-kanal-corner-villa-bahria-town-rawalpindi": [
      "electricity", "gas", "water", "sewerage", "boundary-wall", "security", "cctv", "parking", "corner", "park-facing", "servant-quarter",
    ],
    "10-marla-plots-bahria-town-karachi": [
      "electricity", "water", "gas", "sewerage", "boundary-wall", "corner", "mosque", "school-nearby",
    ],
  };
  for (const l of SAMPLE_LISTINGS) l.featureKeys = tags[l.slug] ?? [];
}

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: "p1", slug: "eco-heights-housing-society", name: "Eco Heights Housing Society",
    category: "Private Society", status: "pre_launch", location: "G-15, Islamabad",
    priceFrom: "PKR 38 Lakh", units: "5 Marla – 1 Kanal", image: img("society-aerial.jpg"),
    description:
      "New biometric-gated residential scheme in G-15 Islamabad with parks, masjid and full utilities. Files available at pre-launch rates with 3-year installment plans.",
    featured: true,
  },
  {
    id: "p2", slug: "skyline-residences-gulberg-lahore", name: "Skyline Residences",
    category: "Branded Tower", status: "booking", location: "Gulberg, Lahore",
    priceFrom: "PKR 2.4 Cr", units: "1–4 bed apartments", image: img("apartment-tower.jpg"),
    description:
      "A 31-floor iconic tower by a reputed developer. Rooftop infinity pool, concierge and branded interiors. Handover 2027 with milestone-based payments.",
    featured: true,
  },
  {
    id: "p3", slug: "bahria-town-sapphire", name: "Bahria Town Sapphire",
    category: "Gated Community", status: "possession", location: "Bahria Town, Rawalpindi",
    priceFrom: "PKR 48 Lakh", units: "5 Marla – 1 Kanal", image: img("city-marquee.jpg"),
    description:
      "Self-contained community with mosques, theme parks and a golf course. Full possession and development in progress.",
    featured: true,
  },
  {
    id: "p4", slug: "vista-green-dha-city", name: "Vista Green, DHA City",
    category: "JDA Scheme", status: "booking", location: "DHA City, Lahore",
    priceFrom: "PKR 1.2 Cr", units: "10 Marla houses", image: img("house-stone-grey.jpg"),
    description:
      "Contemporary 10-Marla homes in a new DHA City sector, offering modern living at a compelling price point.",
    featured: false,
  },
];

export const SAMPLE_CITIES: CityOption[] = [
  { slug: "islamabad", name: "Islamabad", listings: 640 },
  { slug: "lahore", name: "Lahore", listings: 1210 },
  { slug: "karachi", name: "Karachi", listings: 520 },
  { slug: "rawalpindi", name: "Rawalpindi", listings: 1080 },
  { slug: "peshawar", name: "Peshawar", listings: 210 },
  { slug: "faisalabad", name: "Faisalabad", listings: 175 },
];

/** Public image paths for area tiles & static editorial sections. */
export const AREA_TILES = [
  { name: "DHA, Lahore", listings: "1,210", image: img("villa-modern-white.jpg"), href: "/properties?city=lahore" },
  { name: "Gulberg Greens, Islamabad", listings: "640", image: img("apartment-tower.jpg"), href: "/properties?city=islamabad" },
  { name: "Bahria Town, Rawalpindi", listings: "1,080", image: img("society-aerial.jpg"), href: "/properties?city=rawalpindi" },
  { name: "F-7, Islamabad", listings: "312", image: img("house-stone-grey.jpg"), href: "/properties?city=islamabad" },
  { name: "Clifton, Karachi", listings: "520", image: img("city-marquee.jpg"), href: "/properties?city=karachi" },
  { name: "E-11, Islamabad", listings: "245", image: img("interior-living.jpg"), href: "/properties?city=islamabad" },
];
