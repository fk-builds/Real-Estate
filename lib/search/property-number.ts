import type { Listing } from "@/lib/data/types";

/**
 * PROPERTY / PLOT NUMBER SEARCH
 * ------------------------------
 * Lets a visitor search "Plot 123", "house 22-B", "apt 2103", "plot 41 & 42"
 * and land on the exact property — regardless of which catalogue word the
 * listing uses. Property numbers live on listings as `plotNumber`; their
 * position in the hierarchy is the listing's `locationId` FK into the
 * location tree (project → phase → sector → block). Matching here is pure and
 * index-friendly: we normalise both sides to a comparable "number code" and
 * test substring/token equality, so a query like "Plot 12-C" matches
 * `plotNumber = "House 12-C"`. (The persisted DB equivalent + its indexes
 * live in supabase/sql/property-number-search.sql.)
 */

/** Words that introduce a plot/property reference ("Plot 123", "House 12-A"). */
const DESIGNATOR =
  /\b(plot|plots|house|houses|home|homes|file|files|shop|shops|unit|units|apt|apartment|apartments|office|offices|penthouse|pent|flat|flats|shop|khata|property|residential plot)\b/gi;

/** Drop anything in parentheses — "Plot 17 (corner)" → "Plot 17". */
const PAREN = /\s*\([^)]*\)/g;

function hasDigit(s: string): boolean {
  return /\d/.test(s);
}

/** Remove designator words and parenthetical notes (case-insensitive). */
function scrub(s: string): string {
  return s.replace(PAREN, " ").replace(DESIGNATOR, " ").replace(/\s+/g, " ").trim();
}

/** "House 22-B" → "22b"; "41 & 42" → "41" & "42" (kept as separate tokens). */
function tokenCodes(s: string): string[] {
  return scrub(s)
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => tok.replace(/[^a-z0-9]/gi, "").toLowerCase())
    .filter((tok) => hasDigit(tok));
}

/** Whole-string merged code: "plot 12-c" → "12c". */
function mergedCode(s: string): string {
  return scrub(s).replace(/[^a-z0-9]/gi, "").toLowerCase();
}

/**
 * Is this free-text query a property-number lookup? Heuristic: it must contain
 * a digit, and either name a designator (plot/house/file…) or be a short code
 * ("123", "12-c") rather than ordinary prose ("3 bedroom apartment").
 */
export function isPropertyNumberQuery(q: string | undefined): boolean {
  if (!q || !hasDigit(q)) return false;
  const t = q.trim();
  if (DESIGNATOR.test(t)) return true;
  const alnum = t.replace(/[^a-z0-9]/gi, "");
  const letters = alnum.replace(/\d/g, "").length;
  return alnum.length > 0 && alnum.length <= 8 && letters <= 3;
}

/** True when the listing's plot/property number matches the query. */
export function matchesPropertyNumber(l: Pick<Listing, "plotNumber">, q: string): boolean {
  if (!isPropertyNumberQuery(q) || !l.plotNumber) return false;
  const lc = mergedCode(l.plotNumber);
  const qc = mergedCode(q);
  if (!lc || !qc) return false;
  if (lc === qc || lc.includes(qc) || qc.includes(lc)) return true;
  const lt = tokenCodes(l.plotNumber);
  const qt = tokenCodes(q);
  return qt.some((a) => lt.some((b) => a === b || b.includes(a) || a.includes(b)));
}

/**
 * Resolved location breadcrumb for a matched listing — the "locate" answer:
 * Project → Phase → Sector → Block → <Property Number>. Uses only the enriched
 * hierarchy fields (never stored text), so it reflects the real location tree.
 */
export function plotLocationChain(l: Listing): string[] {
  const chain: string[] = [];
  if (l.project?.name) chain.push(l.project.name);
  if (l.phase) chain.push(l.phase);
  if (l.sector) chain.push(l.sector);
  if (l.block) chain.push(l.block);
  if (chain.length && l.plotNumber) chain.push(l.plotNumber);
  return chain;
}
