import type { Listing } from "@/lib/data/types";

/**
 * MAP GEOGRAPHY
 * -------------
 * Lightweight, data-driven geography for the interactive map. Property markers
 * come straight from each listing's lat/lng (a direct DB index candidate).
 * Project/society boundaries are provided as simple closed polygons where the
 * geography is known (for the seeded societies). Everything here is plain
 * serialisable data so it can cross the server→client boundary for the lazy,
 * client-only map.
 *
 * NOTE on performance: the heavy map engine (Leaflet) is NOT bundled into page
 * HTML — it is dynamically imported only after the user opts in to view the
 * map, so loading expensive map functionality is deferred until necessary.
 */

/** A ring of [lat, lng] vertices (polygons are implicitly closed by Leaflet). */
export type GeoPoint = [number, number];

export interface ProjectBoundary {
  slug: string;
  name: string;
  citySlug: string;
  ring: GeoPoint[];
}

export interface CityCenter { lat: number; lng: number; zoom: number }

/** Where a marker/listing must be: the data the map actually needs. */
export interface MapListing {
  id: string;
  slug: string;
  title: string;
  priceDisplay: string;
  coverImage: string;
  citySlug: string;
  cityName: string;
  areaLabel: string;
  projectName?: string;
  projectSlug?: string;
  phase?: string;
  sector?: string;
  block?: string;
  plotNumber?: string;
  lat?: number;
  lng?: number;
  purpose: string;
}

export const CITY_CENTERS: Record<string, CityCenter> = {
  islamabad: { lat: 33.6844, lng: 73.0479, zoom: 12 },
  lahore: { lat: 31.5204, lng: 74.3587, zoom: 11 },
  karachi: { lat: 24.8607, lng: 67.0011, zoom: 11 },
  rawalpindi: { lat: 33.6007, lng: 73.0679, zoom: 12 },
  peshawar: { lat: 34.0151, lng: 71.5249, zoom: 11 },
  faisalabad: { lat: 31.4504, lng: 73.135, zoom: 11 },
};

export function cityCenter(slug: string | undefined): CityCenter {
  return CITY_CENTERS[slug ?? ""] ?? { lat: 30.3753, lng: 69.3451, zoom: 5 };
}

/**
 * Boundaries for societies where we hold geography. These are indicative,
 * map-facing polygons (a real deployment would source authoritative NOC /
 * cadastral boundaries from a geo dataset into a `project_boundaries` table).
 */
export const PROJECT_BOUNDARIES: ProjectBoundary[] = [
  {
    slug: "dha-lahore", name: "DHA Lahore", citySlug: "lahore",
    ring: [[31.472, 74.372], [31.475, 74.435], [31.437, 74.452], [31.418, 74.434], [31.423, 74.381], [31.448, 74.365]],
  },
  {
    slug: "bahria-town", name: "Bahria Town", citySlug: "rawalpindi",
    ring: [[33.605, 73.020], [33.560, 73.045], [33.530, 73.030], [33.528, 73.070], [33.556, 73.135], [33.610, 73.095]],
  },
  {
    slug: "bahria-town-karachi", name: "Bahria Town Karachi", citySlug: "karachi",
    ring: [[25.105, 67.075], [25.040, 67.055], [24.915, 67.095], [24.925, 67.205], [25.050, 67.225], [25.110, 67.150]],
  },
  {
    slug: "eco-heights-housing-society", name: "Eco Heights", citySlug: "islamabad",
    ring: [[33.675, 72.945], [33.655, 72.945], [33.630, 72.960], [33.628, 72.990], [33.652, 73.000], [33.674, 72.985]],
  },
  {
    slug: "gulberg-greens", name: "Gulberg Greens", citySlug: "islamabad",
    ring: [[33.711, 73.048], [33.706, 73.068], [33.690, 73.082], [33.678, 73.072], [33.680, 73.052], [33.698, 73.043]],
  },
];

/** Serialisable, compact marker payload extracted from a full Listing. */
export function toMapListing(l: Listing): MapListing {
  return {
    id: l.id,
    slug: l.slug,
    title: l.title,
    priceDisplay: l.priceDisplay,
    coverImage: l.coverImage,
    citySlug: l.citySlug,
    cityName: l.cityName,
    areaLabel: l.areaLabel,
    projectName: l.project?.name,
    projectSlug: l.project?.slug,
    phase: l.phase,
    sector: l.sector,
    block: l.block,
    plotNumber: l.plotNumber,
    lat: l.latitude,
    lng: l.longitude,
    purpose: l.purpose,
  };
}
