import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import type { Listing, Project, CityOption, LocationNode } from "@/lib/data/types";
import type { PropertyFeature } from "@/lib/data/features";
import { FEATURE_DEFAULTS } from "@/lib/data/features";
import { ensureMedia } from "@/lib/data/media";
import { SAMPLE_LISTINGS, SAMPLE_PROJECTS, SAMPLE_CITIES } from "@/lib/data/sample";
import { SAMPLE_LOCATIONS } from "@/lib/data/location-seed";
import { ADVISORS, type Agent } from "@/lib/data/agents";
import { sampleLeads, type Lead } from "@/lib/data/leads";

/**
 * LOCAL JSON persistence — powers the LOCAL dev mode AND the admin dashboard
 * so admin CRUD is genuinely functional without a live backend.
 *
 * The data shape mirrors what Supabase tables return, so when you set
 * DATA_PROVIDER=supabase the same admin operations target PostgreSQL instead
 * (via the service-role client + RLS). See LocalStore/SupabaseStore.
 */

export interface LocalDb {
  listings: Listing[];
  projects: Project[];
  cities: CityOption[];
  /** relational location tree (Country…Block) as discrete parent/child nodes */
  locations: LocationNode[];
  /** feature-tag dictionary (admin-manageable, data-driven) */
  features: PropertyFeature[];
  /** advisor/agent directory (admin-manageable) */
  agents: Agent[];
  /** enquiry leads (created by the public lead form, managed in admin) */
  leads: Lead[];
  cms: Record<string, string>;
}

export { SAMPLE_LOCATIONS };

const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "db.json");

/** Seed agents = the marketing advisor directory, with empty mgmt fields. */
function seedAgents(): Agent[] {
  return ADVISORS.map((a) => ({ ...a, bio: "", specialization: "", active: true }));
}

export function seedDb(): LocalDb {
  return {
    listings: structuredClone(SAMPLE_LISTINGS),
    projects: structuredClone(SAMPLE_PROJECTS),
    cities: structuredClone(SAMPLE_CITIES),
    locations: structuredClone(SAMPLE_LOCATIONS),
    features: structuredClone(FEATURE_DEFAULTS),
    agents: seedAgents(),
    leads: sampleLeads(),
    cms: {
      heroHeading: "Find the home that feels like yours.",
      heroTagline:
        "Manzil pairs a national marketplace with senior advisors, so you can search, compare and close on Pakistan's finest houses, plots and developments — with total confidence.",
      whyTitle: "Buy, sell & invest without the guesswork",
      contactEmail: "info@manzil.pk",
      contactPhone: "+92 300 000 0000",
    },
  };
}

let cache: LocalDb | null = null;

export async function loadDb(): Promise<LocalDb> {
  if (cache) return cache;
  try {
    const raw = await fsp.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw) as LocalDb;
    // migrate older snapshots: relational location tree + feature dictionary
    if (!Array.isArray(parsed.locations) || !parsed.locations.length) {
      parsed.locations = structuredClone(SAMPLE_LOCATIONS);
    }
    if (!Array.isArray(parsed.features) || !parsed.features.length) {
      parsed.features = structuredClone(FEATURE_DEFAULTS);
    }
    // cache is set before mutation so persist() below actually writes it
    cache = parsed;
    // media: backfill an ordered MediaItem[] for records that predate the
    // property_media model (derived from their cover/gallery + scalar URLs).
    let mediaChanged = false;
    for (const l of parsed.listings) {
      if (!Array.isArray(l.media) || !l.media.length) {
        l.media = ensureMedia(l);
        mediaChanged = true;
      }
    }
    // agents + leads: backfill for snapshots that predate the admin directories
    let mgmtChanged = false;
    if (!Array.isArray(parsed.agents) || !parsed.agents.length) {
      parsed.agents = seedAgents();
      mgmtChanged = true;
    }
    if (!Array.isArray(parsed.leads)) {
      parsed.leads = sampleLeads();
      mgmtChanged = true;
    }
    if (mediaChanged || mgmtChanged) await persist();
  } catch {
    cache = seedDb();
    await persist();
  }
  return cache;
}

export async function persist(): Promise<void> {
  if (!cache) return;
  await fsp.mkdir(DIR, { recursive: true });
  await fsp.writeFile(FILE, JSON.stringify(cache, null, 2), "utf-8");
}

export function idgen(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Reject an incoming item against the public site filters (publish on/off). */
export function isPublic(l: Listing): boolean {
  return l.published !== false;
}

export function hasFile(): boolean {
  return fs.existsSync(FILE);
}

/** Reset the whole local DB back to seeds (dev convenience). */
export async function resetDb(): Promise<LocalDb> {
  cache = seedDb();
  await persist();
  return cache;
}
