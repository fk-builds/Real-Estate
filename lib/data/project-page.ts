import type { Listing, LocationNode, Project } from "./types";
import { loadDb, type LocalDb } from "@/lib/db/local-db";
import { descendants, pathTo } from "./hierarchy";
import { SAMPLE_PROJECTS } from "./sample";

/**
 * PROJECT / HOUSING-SOCIETY pages.
 *
 * A "project" here is a housing society/development. It is resolved two ways:
 *  1. a `project`-level node in the relational location tree (e.g. DHA Lahore),
 *     which gives us its phases / sectors / blocks and the properties inside it
 *     (listings whose locationId sits in that society's subtree); or
 *  2. a marketing development from the `projects` catalogue.
 * Rich editorial content (amenities, FAQs, status, map, gallery, contact) is
 * keyed by slug in SOCIETY_CONTENT and falls back to sensible defaults.
 */

export interface SocietyChild {
  name: string;
  slug: string;
  count: number; // listings beneath this child (recursively)
}

export interface SocietyFaq { q: string; a: string }

export interface SocietyModel {
  slug: string;
  name: string;
  /** location line e.g. "Lahore, Punjab" */
  place: string;
  city: string;
  citySlug: string;
  kindLabel: string; // "Housing Society" | "New Development" | "Branded Tower"
  tagline: string;
  description: string[]; // paragraphs
  cover: string;
  gallery: string[];
  devStatus: string;
  statusMeta: Array<{ label: string; value: string }>;
  unitsText?: string;
  priceFrom?: string;
  amenities: string[];
  faqs: SocietyFaq[];
  contact: { phone: string; email: string; whatsapp: string };
  coords?: { lat: number; lng: number };
  phases: SocietyChild[];
  sectors: SocietyChild[];
  blocks: SocietyChild[];
  /** published listings inside the society */
  listings: Listing[];
  related: Array<{ slug: string; name: string; cover: string; place: string }>;
}

const CONTACT = { phone: "+92 300 000 0000", whatsapp: "923000000000", email: "info@manzil.pk" };
const img = (p: string) => `/images/${p}`;

type Content = Partial<SocietyModel>;

/** Authoritative editorial content per society slug. */
const SOCIETY_CONTENT: Record<string, Content> = {
  "dha-lahore": {
    tagline: "Pakistan's most prestigious planned community",
    devStatus: "Development complete · Possession ongoing",
    coords: { lat: 31.4336, lng: 74.4137 },
    statusMeta: [
      { label: "Established", value: "1996" }, { label: "Developer", value: "Defence Housing Authority" },
      { label: "Land area", value: "~10,000 acres" }, { label: "Community", value: "Gated & secure" },
    ],
    description: [
      "DHA Lahore is the flagship of Pakistan's Defence Housing Authority — a master-planned, gated community of over ten thousand acres divided into numbered phases, sectors and blocks. Wide tree-lined boulevards, parks at every corner and strict architecture controls keep the environment calm and premium.",
      "Residents enjoy 24/7 security and CCTV at entry points, dedicated commercial zones, world-class schools, hospitals and mosques within minutes of every block, and a strong resale market backed by transparent transfer at DHA office.",
    ],
    amenities: [
      "24/7 security & CCTV gates", "Parks & green belts in every block", "Commercial zones & markets",
      "Schools & colleges", "Hospitals & clinics", "Mosques & community centres", "Golf & country club",
      "Own sewerage & water supply", "Wide tree-lined boulevards", "Strict architecture control",
    ],
    faqs: [
      { q: "How do I buy a file or plot in DHA Lahore?", a: "You need an open file or a property already in DHA's records. Manzil verifies the ownership and NOC before transfer and handles the full process with the DHA office." },
      { q: "Which DHA phase is best to invest in?", a: "It depends on budget and horizon — newer phases (6–9) offer lower entry and better capital growth, while settled phases (2–5) are move-in ready with mature infrastructure." },
      { q: "Does Manzil handle DHA transfers?", a: "Yes — our advisors arrange the DHA transfer application, required affidavits and coordinate the fee payment and possession handover." },
    ],
    contact: CONTACT,
  },
  "bahria-town": {
    tagline: "A self-contained city of neighbourhoods near the capital",
    devStatus: "Development ongoing · Possession in most phases",
    coords: { lat: 33.5206, lng: 73.0933 },
    statusMeta: [
      { label: "Established", value: "1996" }, { label: "Developer", value: "Bahria Town (Pvt) Ltd" },
      { label: "Land area", value: "~18,000 acres" }, { label: "Community", value: "Gated & secure" },
    ],
    description: [
      "Bahria Town Rawalpindi is one of Asia's largest private housing schemes, developed as a series of secure, self-contained neighbourhoods on the north-western edge of Rawalpindi. Each phase is gated with its own mosque, parks, shopping streets and civic facilities.",
      "Phase 7 and Phase 8 offer a full range from plots and villas to ready homes, connected by the main boulevard and the Grand Mosque and commercial heart of the town.",
    ],
    amenities: [
      "Gated security & CCTV", "Central mosque & theme parks", "Shopping streets & malls",
      "Schools & hospital", "Golf course & sporting facilities", "Own water & power infrastructure",
      "Jogging & community parks", "Commercial & civic centres",
    ],
    faqs: [
      { q: "Can I buy a Bahria Town file easily?", a: "Yes — Bahria is one of the easiest societies to transact in, with an efficient file/possession transfer and clear developer pricing. Manzil verifies the file and negotiates the best rate." },
      { q: "Are Bahria houses ready to move in?", a: "Many phases are at full possession with completed homes; Manzil lists both ready homes and plots for you to build." },
      { q: "What makes Phase 8 different?", a: "Phase 8 is the premium, most recent phase with larger plots, modern sectors (A–E) and better returns — many clients favour it for investment." },
    ],
    contact: CONTACT,
  },
  "bahria-town-karachi": {
    tagline: "Secure coastal living on Karachi's outskirts",
    devStatus: "Development ongoing · File & possession sales",
    coords: { lat: 25.0398, lng: 67.1187 },
    description: [
      "Bahria Town Karachi brings Bahria's self-contained, gated-city model to the south — broad avenues, precinct-based living, mosques, parks and a golf city, with plots sized from small residential units to large farm and commercial parcels.",
    ],
    amenities: ["Gated security", "Precinct parks & mosques", "Golf city", "Shopping & civic areas"],
    faqs: [{ q: "What sizes of plots are available?", a: "From 10 marla residential plots up to larger commercial and farm parcels across the precincts — Manzil can match you to the best value." }],
    contact: CONTACT,
  },
  "eco-heights-housing-society": {
    tagline: "An NOC-approved green society in G-15, Islamabad",
    devStatus: "Pre-launch · Files available",
    coords: { lat: 33.6601, lng: 72.9762 },
    description: [
      "Eco Heights is a new biometric-gated residential scheme in sector G-15 Islamabad, approved by the Capital Development Authority. Fresh master-planned sectors around parks and a central green with full utilities and a 3-year instalment plan.",
    ],
    amenities: ["NOC approved (CDA)", "Parks & masjid", "Biometric gated entry", "Full utilities", "3-year instalments"],
    faqs: [{ q: "Is Eco Heights NOC approved?", a: "Yes — it is CDA-approved, which is the key risk-mitigating step for a new society." }],
    contact: CONTACT,
  },
  "gulberg-greens": {
    tagline: "A green, low-density enclave in the heart of Islamabad",
    devStatus: "Developed · Few resales",
    coords: { lat: 33.6936, lng: 73.0648 },
    description: [
      "Gulberg Greens is one of Islamabad's most exclusive, low-density residential projects — large plots, tree-lined streets and strict building rules minutes from the city centre, prized by families for space and privacy.",
    ],
    amenities: ["Low-density plots", "Parks & green belts", "Strict building control", "Secure community"],
    contact: CONTACT,
  },
};

function fallbackContent(name: string, kindLabel: string): Content {
  return {
    tagline: `${name} — ${kindLabel}`,
    devStatus: "Development & sales ongoing",
    description: [`${name} is a planned ${kindLabel.toLowerCase()} in Pakistan. Browse available phases, sectors and properties below, or contact an advisor for the latest prices and development updates.`],
    amenities: ["Secure community", "Parks & open spaces", "Utilities & infrastructure", "Gated entry", "Mosques & civic facilities"],
    faqs: [{ q: `What's available in ${name}?`, a: "Check the live available properties and each phase below — or message an advisor for current price lists and possession timelines." }],
    contact: CONTACT,
  };
}

function galleryFor(slug: string): string[] {
  const map: Record<string, string[]> = {
    "dha-lahore": [img("hero.jpg"), img("city-marquee.jpg"), img("interior-living.jpg")],
    "bahria-town": [img("villa-modern-white.jpg"), img("city-marquee.jpg"), img("house-stone-grey.jpg")],
    "bahria-town-karachi": [img("society-aerial.jpg"), img("city-marquee.jpg")],
    "eco-heights-housing-society": [img("society-aerial.jpg"), img("villa-modern-white.jpg")],
    "gulberg-greens": [img("house-stone-grey.jpg"), img("villa-modern-white.jpg")],
  };
  return map[slug] ?? [img("society-aerial.jpg"), img("city-marquee.jpg")];
}

/** Resolve a housing-society / development for a slug (local data). */
export async function resolveSociety(slug: string): Promise<SocietyModel | null> {
  const db: LocalDb = await loadDb();
  const node = db.locations.find((n) => n.level === "project" && n.slug === slug) ?? null;

  // Phase/sector/block derived from the location tree beneath this society.
  const childNames = (level: string): SocietyChild[] => {
    const parentId = node ? node.id : null;
    if (!parentId) return [];
    const ids = node ? descendants(db.locations, node.id) : [];
    const nodes = db.locations.filter((n) => n.level === level && (parentId ? ids.includes(n.id) : false));
    return nodes.map((n) => {
      const sub = descendants(db.locations, n.id);
      const count = db.listings.filter((l) => l.published !== false && (l.locationId === n.id || sub.includes(l.locationId ?? ""))).length;
      return { name: n.name, slug: n.slug, count };
    });
  };

  // Published listings living inside the society subtree.
  const societyId = node ? node.id : null;
  let listings: Listing[] = [];
  let place = "";
  let city = "";
  let citySlug = "";
  if (node) {
    const sub = societyId ? descendants(db.locations, societyId) : [];
    listings = db.listings
      .filter((l) => l.published !== false && (l.locationId === societyId || sub.includes(l.locationId ?? "")))
      .map((l) => ({ ...l, locationPath: pathTo(db.locations, l.locationId).map((n) => n.name) }));
    const path = pathTo(db.locations, node.id);
    city = path.find((n) => n.level === "city")?.name ?? "";
    citySlug = path.find((n) => n.level === "city")?.slug ?? "";
    const province = path.find((n) => n.level === "province")?.name ?? "";
    place = [city, province].filter(Boolean).join(", ");
  }

  // Marketing catalogue entry if it exists (name/price/cover/units).
  const proj: Project | undefined = SAMPLE_PROJECTS.find((p) => p.slug === slug);
  const content: Content = SOCIETY_CONTENT[slug] ?? fallbackContent(node?.name ?? proj?.name ?? "Project", kindOf(node, proj));
  const name = proj?.name ?? node?.name ?? slug.split("-").map(cap).join(" ");
  const kindLabel = kindOf(node, proj);
  const cover = proj?.image ?? galleryFor(slug)[0];
  const cityFromProj = proj?.location ? proj.location.split(",")[0].trim() : "";

  // Related: sibling projects + other marketing developments (exclude self).
  const related: SocietyModel["related"] = [];
  const pushRel = (s: string) => {
    if (s === slug || related.some((r) => r.slug === s)) return;
    const otherNode = db.locations.find((n) => n.level === "project" && n.slug === s);
    const otherProj = SAMPLE_PROJECTS.find((p) => p.slug === s);
    if (otherNode || otherProj) {
      const p2 = pathTo(db.locations, otherNode?.id ?? "");
      related.push({
        slug: s,
        name: otherProj?.name ?? otherNode?.name ?? s,
        cover: otherProj?.image ?? galleryFor(s)[0],
        place: [p2.find((n) => n.level === "city")?.name ?? "", otherProj?.location ?? ""].filter(Boolean).join(", "),
      });
    }
  };
  db.locations.filter((n) => n.level === "project").forEach((n) => pushRel(n.slug));
  SAMPLE_PROJECTS.forEach((p) => pushRel(p.slug));

  return {
    slug,
    name,
    place: place || proj?.location || city || "Pakistan",
    city: city || cityFromProj || citySlug,
    citySlug: citySlug || "",
    kindLabel,
    tagline: content.tagline ?? "",
    description: content.description?.length ? content.description : [proj?.description ?? content.description?.[0] ?? ""],
    cover,
    gallery: content.gallery?.length ? content.gallery : galleryFor(slug),
    devStatus: proj?.status ?? content.devStatus ?? "",
    statusMeta: content.statusMeta?.length ? content.statusMeta : [],
    unitsText: proj?.units,
    priceFrom: proj?.priceFrom,
    amenities: content.amenities?.length ? content.amenities : [],
    faqs: content.faqs?.length ? content.faqs : [],
    contact: content.contact ?? CONTACT,
    coords: content.coords,
    phases: childNames("phase"),
    sectors: childNames("sector"),
    blocks: childNames("block"),
    listings,
    related: related.slice(0, 6),
  };
}

function kindOf(node: LocationNode | null, proj?: Project): string {
  if (proj?.category) return proj.category; // "Private Society" | "Branded Tower" | "Gated Community" | "JDA Scheme"
  if (node) return "Housing Society";
  return "Development";
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

/** Display location path for a raw listing within a society (server pages). */
export function listingPath(db: LocalDb, listing: Listing): string[] {
  return pathTo(db.locations, listing.locationId).map((n) => n.name);
}

export interface SocietyLink { slug: string; name: string; place: string; cover: string; citySlug: string }

/** Compact list of all housing-society nodes (for indexes / discovery). */
export async function listSocieties(): Promise<SocietyLink[]> {
  const db: LocalDb = await loadDb();
  return db.locations
    .filter((n) => n.level === "project")
    .map((n) => {
      const path = pathTo(db.locations, n.id);
      const city = path.find((x) => x.level === "city")?.name ?? "";
      const province = path.find((x) => x.level === "province")?.name ?? "";
      const sub = descendants(db.locations, n.id);
      const active = db.listings.filter((l) => l.published !== false && (l.locationId === n.id || sub.includes(l.locationId ?? ""))).length;
      void active;
      return {
        slug: n.slug,
        name: n.name,
        place: [city, province].filter(Boolean).join(", "),
        cover: SOCIETY_CONTENT[n.slug]?.coords ? galleryFor(n.slug)[0] : galleryFor(n.slug)[0],
        citySlug: city.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      };
    })
    .filter((s) => Boolean(s.name));
}


