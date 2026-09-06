import type { LocationNode } from "./types";

/**
 * Seeded location TREE — stored as discrete parent→child nodes (relational),
 * never a concatenated path string. Mirrors the Postgres relational tables.
 *
 *         Pakistan
 *        ├─ Punjab ── Lahore ── DHA ── DHA Lahore ── Phase 6 ── Sector A ── Block A
 *        │    │            └─ Gulberg ── Skyline Residences
 *        │    ├─ Rawalpindi ── Bahria Town ── Phase 7 ── Sector C
 *        │    │                          └─ Phase 8 ── Sector E
 *        ├─ Islamabad (territory) ── Islamabad ── Gulberg Greens
 *        │                      │        └─ F-7 / E-11 / Eco Heights
 *        └─ Sindh ── Karachi ── Clifton ── Block 4
 *                        └─ Bahria Town Karachi ── Precinct 19
 */

function N(id: string, parentId: string | null, level: LocationNode["level"], name: string, slug?: string): LocationNode {
  return { id, parentId, level, name, slug: slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-") };
}

export const ROOT = "pk";
export const SAMPLE_LOCATIONS: LocationNode[] = [
  // country + provinces
  N("pk", null, "country", "Pakistan"),
  N("punjab", "pk", "province", "Punjab"),
  N("isb-cap", "pk", "province", "Islamabad Capital Territory"),
  N("sindh", "pk", "province", "Sindh"),
  N("kpk", "pk", "province", "Khyber Pakhtunkhwa"),

  // cities under Punjab
  N("lahore", "punjab", "city", "Lahore"),
  N("rawalpindi", "punjab", "city", "Rawalpindi"),
  N("faisalabad", "punjab", "city", "Faisalabad"),

  // cities under ICT
  N("islamabad", "isb-cap", "city", "Islamabad"),

  // cities under Sindh
  N("karachi", "sindh", "city", "Karachi"),

  // Islamabad areas/societies
  N("gulberg-greens", "islamabad", "project", "Gulberg Greens"),
  N("f7", "islamabad", "area", "F-7"),
  N("e11", "islamabad", "area", "E-11"),
  N("eco-heights", "islamabad", "project", "Eco Heights Housing Society"),
  N("eco-h-p1", "eco-heights", "phase", "Phase 1"),
  N("eco-h-sg", "eco-h-p1", "sector", "Sector G"),

  // Lahore: DHA area + DHA Lahore project (the full worked example)
  N("dha", "lahore", "area", "DHA"),
  N("dha-lahore", "dha", "project", "DHA Lahore"),
  N("dha-ph6", "dha-lahore", "phase", "Phase 6", "phase-6"),
  N("dha-ph6-sec-a", "dha-ph6", "sector", "Sector A", "sector-a"),
  N("dha-ph6-sec-a-blk-a", "dha-ph6-sec-a", "block", "Block A", "block-a"),
  N("dha-ph6-sec-a-blk-b", "dha-ph6-sec-a", "block", "Block B", "block-b"),
  N("dha-ph6-sec-b", "dha-ph6", "sector", "Sector B", "sector-b"),
  N("dha-ph6-sec-b-blk-c", "dha-ph6-sec-b", "block", "Block C", "block-c"),
  N("dha-ph7", "dha-lahore", "phase", "Phase 7", "phase-7"),
  N("dha-ph8", "dha-lahore", "phase", "Phase 8", "phase-8"),
  N("dha-ph8-blk-j", "dha-ph8", "block", "Block J", "block-j"),
  N("gulberg", "lahore", "area", "Gulberg"),
  N("gulberg-mmalam", "gulberg", "block", "MM Alam Road"),

  // Rawalpindi: Bahria Town
  N("bahria-rwp", "rawalpindi", "project", "Bahria Town"),
  N("bahria-p7", "bahria-rwp", "phase", "Phase 7"),
  N("bahria-p7-blk-c", "bahria-p7", "block", "Block C"),
  N("bahria-p8", "bahria-rwp", "phase", "Phase 8"),
  N("bahria-p8-se", "bahria-p8", "sector", "Sector E"),

  // Karachi
  N("clifton", "karachi", "area", "Clifton"),
  N("clifton-blk4", "clifton", "block", "Block 4"),
  N("bahria-khi", "karachi", "project", "Bahria Town Karachi"),
  N("bahria-khi-p19", "bahria-khi", "block", "Precinct 19"),
];
