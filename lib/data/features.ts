/**
 * PROPERTY FEATURES — data-driven tag catalogue.
 *
 * This is the DEFAULT seed for the feature dictionary. In local mode the
 * dictionary is persisted in data/db.json (admin can add/edit/remove tags and
 * categories); in Supabase mode it is the `property_features` table. Listings
 * store only feature KEYS; labels & categories are resolved here or from the
 * stored dictionary so the UI never hardcodes a fixed set of features.
 */
export type FeatureCategory =
  | "Utilities"
  | "Structure"
  | "Parking & Security"
  | "Amenities"
  | "Furnishing"
  | "Location & Facing";

export interface PropertyFeature {
  key: string;
  label: string;
  category: FeatureCategory;
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  "Utilities",
  "Structure",
  "Parking & Security",
  "Amenities",
  "Furnishing",
  "Location & Facing",
];

/** Default catalogue — mirrors the SQL seed in docs/property-features.sql. */
export const FEATURE_DEFAULTS: PropertyFeature[] = [
  { key: "electricity", label: "Electricity", category: "Utilities" },
  { key: "gas", label: "Gas", category: "Utilities" },
  { key: "water", label: "Water", category: "Utilities" },
  { key: "sewerage", label: "Sewerage", category: "Utilities" },
  { key: "boundary-wall", label: "Boundary Wall", category: "Structure" },
  { key: "basement", label: "Basement", category: "Structure" },
  { key: "roof-access", label: "Roof Access", category: "Structure" },
  { key: "servant-quarter", label: "Servant Quarter", category: "Structure" },
  { key: "parking", label: "Parking", category: "Parking & Security" },
  { key: "security", label: "Security", category: "Parking & Security" },
  { key: "cctv", label: "CCTV", category: "Parking & Security" },
  { key: "swimming-pool", label: "Swimming Pool", category: "Amenities" },
  { key: "gym", label: "Gym", category: "Amenities" },
  { key: "park", label: "Park", category: "Amenities" },
  { key: "mosque", label: "Mosque", category: "Amenities" },
  { key: "furnished", label: "Furnished", category: "Furnishing" },
  { key: "semi-furnished", label: "Semi Furnished", category: "Furnishing" },
  { key: "unfurnished", label: "Unfurnished", category: "Furnishing" },
  { key: "school-nearby", label: "School Nearby", category: "Location & Facing" },
  { key: "hospital-nearby", label: "Hospital Nearby", category: "Location & Facing" },
  { key: "main-boulevard", label: "Main Boulevard", category: "Location & Facing" },
  { key: "corner", label: "Corner", category: "Location & Facing" },
  { key: "park-facing", label: "Park Facing", category: "Location & Facing" },
  { key: "main-road", label: "Main Road", category: "Location & Facing" },
];

const byKey = new Map(FEATURE_DEFAULTS.map((f) => [f.key, f]));

export function featureLabel(key: string): string {
  return byKey.get(key)?.label ?? key.replace(/-/g, " ");
}

export function featureByKey(key: string): PropertyFeature | undefined {
  return byKey.get(key);
}

/** Resolve stored feature keys into the catalogue objects that still exist. */
export function resolveFeatures(keys: string[], catalogue: PropertyFeature[] = FEATURE_DEFAULTS): PropertyFeature[] {
  const map = new Map(catalogue.map((f) => [f.key, f]));
  return keys.map((k) => map.get(k)).filter((f): f is PropertyFeature => Boolean(f));
}

/** Group resolved features by category (stable category order). */
export function groupFeatures(
  features: PropertyFeature[],
  categories: FeatureCategory[] = FEATURE_CATEGORIES,
): Array<{ category: FeatureCategory; items: PropertyFeature[] }> {
  return categories
    .map((category) => ({ category, items: features.filter((f) => f.category === category) }))
    .filter((g) => g.items.length > 0);
}
