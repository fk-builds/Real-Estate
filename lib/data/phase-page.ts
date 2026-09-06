import type { Listing, LocationNode } from "./types";
import { loadDb, type LocalDb } from "@/lib/db/local-db";
import { childrenOf, descendants, pathTo } from "./hierarchy";
import { resolveSociety } from "./project-page";
import type { SocietyFaq } from "./project-page";

/**
 * SECTOR / BLOCK (and phase) pages.
 *
 * Units are nodes in the relational location tree under a housing-society /
 * project node (project → phase → sector → block). A unit is resolved by
 * walking an explicit slug PATH (e.g. ["phase-6","sector-a","block-a"]) from
 * the society's project node, so every level of the URL is validated against
 * its true parent. Nothing is hardcoded — whatever levels exist in the data
 * render, and empty sections are omitted.
 *
 * Editorial (amenities, gallery, map, contact, tagline) is inherited from the
 * society and optionally overridden per unit in PHASE_CONTENT (keyed by the
 * society + full path).
 */

export interface BlockUnit { name: string; slug: string; count: number; path: string[] }
export interface SectorUnit extends BlockUnit { blocks: BlockUnit[] }
export interface UnitLink { slug: string; name: string; level: string }

export interface PhaseModel {
  societySlug: string;
  societyName: string;
  societyPlace: string;
  slug: string;             // this unit's slug, e.g. "sector-a"
  name: string;             // display name, e.g. "Sector A"
  level: string;            // "phase" | "sector" | "block"
  /** chain above this unit (project … parent), root first */
  ancestors: UnitLink[];
  parent?: UnitLink;        // immediate parent (if any)
  /** full chain including this unit (for breadcrumbs) */
  chain: UnitLink[];
  cover: string;
  tagline: string;
  place: string;            // e.g. "DHA, Lahore, Punjab"
  citySlug: string;
  city: string;
  overview: string[];
  devStatus: string;
  amenities: string[];
  gallery: string[];
  coords?: { lat: number; lng: number };
  faqs: SocietyFaq[];
  contact: { phone: string; email: string; whatsapp: string };
  /** published listings in this unit's subtree */
  listings: Listing[];
  /** direct phase children carrying nested blocks (only meaningful at phase) */
  sectors: SectorUnit[];
  /** block descendants of this unit (any depth) */
  blocks: BlockUnit[];
  /** sibling units under the same parent, same level */
  siblings: Array<{ slug: string; name: string; level: string; count: number }>;
  listingCount: number;
}

const LEVEL_VERB: Record<string, string> = { phase: "phase", sector: "sector", block: "block", area: "area" };

/** Editorial keyed "<societySlug>/<path…>" — optional overrides for any unit. */
type PhaseContent = Partial<Pick<PhaseModel, "overview" | "devStatus" | "tagline" | "coords">>;
const PHASE_CONTENT: Record<string, PhaseContent> = {
  "dha-lahore/phase-6": {
    tagline: "Mature, sought-after DHA living in a fully settled phase",
    devStatus: "Developed · Possession complete · Active resale market",
    overview: [
      "Phase 6 is one of DHA Lahore's most settled and desirable phases — mature landscaping, wide tree-lined streets and homes that have appreciated steadily since development. It sits on the main spines of DHA, minutes from the commercial zones and the phase's own parks and community facilities.",
      "Blocks here are calm residential enclaves with strict architecture control. Because the phase is fully developed, buyers get possession-ready homes, an active resale market and easy transfers through the DHA office — a strong, liquid investment.",
    ],
    coords: { lat: 31.4318, lng: 74.4102 },
  },
  "dha-lahore/phase-6/sector-a": {
    tagline: "Calm, settled residential sector of DHA Phase 6",
    overview: [
      "Sector A of DHA Phase 6 is a fully developed residential sector of tree-lined streets and established homes, close to the phase's parks and commercial spine. Its two blocks (A and B) hold some of the phase's most consistent resale inventory.",
    ],
    coords: { lat: 31.433, lng: 74.409 },
  },
  "dha-lahore/phase-6/sector-a/block-a": {
    tagline: "A prime, fully built-out block of Sector A",
    overview: [
      "Block A of Sector A is one of DHA Phase 6's most settled blocks — mature homes on quiet streets with active utilities and easy access to the sector's parks. Inventory here is limited and turns quickly.",
    ],
    coords: { lat: 31.4336, lng: 74.4106 },
  },
  "dha-lahore/phase-6/sector-a/block-b": {
    tagline: "Investor-favourite block with plot & build opportunities",
    overview: [
      "Block B of Sector A offers a blend of established homes and a handful of clear-title corner plots — a favourite for investors targeting DHA Phase 6's steady capital growth.",
    ],
  },
  "dha-lahore/phase-7": {
    tagline: "Premium new build-out beside DHA's newest expansion",
    devStatus: "Development ongoing · Possession in most blocks",
    overview: [
      "Phase 7 is the fast-developing link between DHA's established centre and the newer expansion phases. Buyers favour it for modern larger blocks, fresh inventory and strong capital-growth potential while it is still filling out.",
    ],
    coords: { lat: 31.447, lng: 74.418 },
  },
  "dha-lahore/phase-8": {
    tagline: "DHA's flagship premium phase — the full worked example",
    devStatus: "Development ongoing · Possession in most blocks",
    overview: [
      "Phase 8 is DHA Lahore's premium, most modern phase, laid out around wide sectors and golf-course frontage. It is where most new construction and premium inventory in DHA is happening today.",
    ],
    coords: { lat: 31.462, lng: 74.427 },
  },
};

function countOf(db: LocalDb, n: LocationNode): number {
  const dd = descendants(db.locations, n.id);
  return db.listings.filter((l) => l.published !== false && (l.locationId === n.id || dd.includes(l.locationId ?? ""))).length;
}

/**
 * Walk the explicit slug path from the society's project node down the tree.
 * Returns the terminal node only if EVERY level exists in the true hierarchy
 * (so /dha-lahore/phase-8/sector-a can never resolve to a sector that belongs
 * to a different phase).
 */
export function findUnitByPath(db: LocalDb, projectNode: LocationNode, slugs: string[]): LocationNode | null {
  let cur = projectNode;
  for (const s of slugs) {
    const child = childrenOf(db.locations, cur.id).find((n) => n.slug === s);
    if (!child) return null;
    cur = child;
  }
  return cur;
}

async function buildModel(societySlug: string, slugs: string[]): Promise<PhaseModel | null> {
  const db: LocalDb = await loadDb();
  const soc = await resolveSociety(societySlug);
  const projectNode = db.locations.find((n) => n.level === "project" && n.slug === societySlug) ?? null;
  if (!soc || !projectNode) return null;
  const node = findUnitByPath(db, projectNode, slugs) ?? resolvePhaseFallback(db, projectNode, slugs);
  if (!node) return null;

  const chain = pathTo(db.locations, node.id);
  const ancestors = chain.slice(0, -1);
  const parent = ancestors[ancestors.length - 1] ? { slug: ancestors[ancestors.length - 1].slug, name: ancestors[ancestors.length - 1].name, level: ancestors[ancestors.length - 1].level } : undefined;
  const links = (ns: LocationNode[]): UnitLink[] => ns.map((n) => ({ slug: n.slug, name: n.name, level: n.level }));

  const key = `${societySlug}/${slugs.join("/")}`;
  const content: PhaseContent = PHASE_CONTENT[key] ?? {};
  const place = chain.map((n) => n.name).filter((n) => n !== "Pakistan").join(", ");
  const city = soc.citySlug || (chain.find((n) => n.level === "city")?.slug ?? "");

  const unitSub = descendants(db.locations, node.id);
  const inUnit = (l: Listing) => l.published !== false && (l.locationId === node.id || unitSub.includes(l.locationId ?? ""));
  const listings = db.listings.filter(inUnit).map((l) => ({ ...l, locationPath: pathTo(db.locations, l.locationId).map((n) => n.name) }));

  const direct = childrenOf(db.locations, node.id);
  const directSectors = direct.filter((n) => n.level === "sector");
  const directBlocks = direct.filter((n) => n.level === "block");

  // Slug path of a unit from the society project down (excludes the project).
  const under = (id: string): string[] => {
    const p = pathTo(db.locations, id).filter((x) => x.level === "project" || x.level === "phase" || x.level === "sector" || x.level === "block");
    return p.map((x) => x.slug).slice(1);
  };

  const sectors: SectorUnit[] = directSectors.map((sec) => {
    const secSub = descendants(db.locations, sec.id);
    const blkNodes = db.locations.filter((n) => n.level === "block" && (n.parentId === sec.id || secSub.includes(n.id)));
    const spath = under(sec.id);
    return {
      name: sec.name, slug: sec.slug, count: countOf(db, sec), path: spath,
      blocks: blkNodes.map((b) => ({ name: b.name, slug: b.slug, count: countOf(db, b), path: spath.concat(b.slug) })),
    };
  });
  const allBlockNodes = db.locations.filter((n) => n.level === "block" && unitSub.includes(n.id));
  const blocks = (allBlockNodes.length ? allBlockNodes : directBlocks)
    .map((b) => ({ name: b.name, slug: b.slug, count: countOf(db, b), path: under(b.id) }));

  const siblings = childrenOf(db.locations, node.parentId).filter((n) => n.id !== node.id && n.level === node.level)
    .map((n) => ({ slug: n.slug, name: n.name, level: n.level, count: countOf(db, n) }));

  const lvl = LEVEL_VERB[node.level] ?? node.level;
  const fallbackOverview = [
    `${node.name} is a ${lvl} of ${projectNode.name} in Pakistan. Browse available properties${directSectors.length ? " and its sectors and blocks" : directBlocks.length ? " and its blocks" : ""} below, or contact an advisor for the latest prices, files and possession timelines.`,
  ];

  return {
    societySlug, societyName: projectNode.name, societyPlace: soc.place,
    slug: node.slug, name: node.name, level: node.level,
    ancestors: links(ancestors), parent, chain: links(chain),
    cover: soc.cover, tagline: content.tagline ?? soc.tagline, place,
    citySlug: city, city: soc.city,
    overview: content.overview?.length ? content.overview : fallbackOverview,
    devStatus: content.devStatus ?? soc.devStatus,
    amenities: soc.amenities, gallery: soc.gallery,
    coords: content.coords ?? soc.coords,
    faqs: soc.faqs.map((f) => ({ ...f })),
    contact: soc.contact,
    listings, sectors, blocks, siblings, listingCount: listings.length,
  };
}

/** Resolve a phase (or any single descendant unit) under a society. */
export async function resolvePhase(societySlug: string, childSlug: string): Promise<PhaseModel | null> {
  return buildModel(societySlug, [childSlug]);
}

/** Resolve a unit by its full path below the society, e.g. ["phase-6","sector-a","block-a"]. */
export async function resolveUnitPath(societySlug: string, slugs: string[]): Promise<PhaseModel | null> {
  if (!slugs.length) return null;
  return buildModel(societySlug, slugs);
}

/**
 * Compatibility fallback: when a single slug is not a direct child of the
 * society (e.g. the shorter /projects/:society/sector-a form), accept it if it
 * uniquely identifies a unit anywhere in the society's subtree.
 */
function resolvePhaseFallback(db: LocalDb, projectNode: LocationNode, slugs: string[]): LocationNode | null {
  if (slugs.length !== 1) return null;
  const sub = descendants(db.locations, projectNode.id);
  return db.locations.find((n) => sub.includes(n.id) && n.slug === slugs[0]) ?? null;
}
