import type { Listing, LocationLevel, LocationNode } from "./types";
import { LOCATION_LEVEL_ORDER } from "./types";

/**
 * Pure helpers over a relational location-tree (array of parent→child nodes).
 * These mirror the SQL: climb parentId to rebuild a path, list children, and
 * total listings in a subtree. Nothing here stores a concatenated path string
 * as the source of truth — a path is always reconstructed from parent links.
 */

const byId = (nodes: LocationNode[]) => new Map(nodes.map((n) => [n.id, n]));

export function nodeById(nodes: LocationNode[], id: string | undefined | null): LocationNode | null {
  if (!id) return null;
  return byId(nodes).get(id) ?? null;
}

export function childrenOf(nodes: LocationNode[], parentId: string | null): LocationNode[] {
  return nodes.filter((n) => n.parentId === parentId);
}

/** Reconstruct root→this path by walking parentId (FK traversal). */
export function pathTo(nodes: LocationNode[], id: string | undefined | null): LocationNode[] {
  if (!id) return [];
  const map = byId(nodes);
  const path: LocationNode[] = [];
  let cur: LocationNode | undefined = map.get(id);
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    path.unshift(cur);
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return path;
}

/** All descendant ids of a node (subtree) — for subtree counts. */
export function descendants(nodes: LocationNode[], id: string): string[] {
  const out: string[] = [];
  const stack = childrenOf(nodes, id);
  while (stack.length) {
    const n = stack.pop()!;
    out.push(n.id);
    for (const c of childrenOf(nodes, n.id)) stack.push(c);
  }
  return out;
}

const LEVEL_LABEL: Record<LocationLevel, string> = {
  country: "Country", province: "Province", city: "City", area: "Area",
  project: "Society / Project", phase: "Phase", sector: "Sector", block: "Block",
};
export function levelLabel(l: LocationLevel): string {
  return LEVEL_LABEL[l];
}

/** Next lower level to show when drilling down a node. */
export function nextLevel(l: LocationLevel): LocationLevel | null {
  const i = LOCATION_LEVEL_ORDER.indexOf(l);
  return i >= 0 && i + 1 < LOCATION_LEVEL_ORDER.length ? LOCATION_LEVEL_ORDER[i + 1] : null;
}

/**
 * Derive a listing's display location (path parts, phase/sector/block, city)
 * from its locationId FK by climbing the tree. This is the ONLY place these
 * labels come from — they are never stored on the listing itself.
 */
export function locationForListing(nodes: LocationNode[], listing: Pick<Listing, "locationId">): {
  path: LocationNode[];
  pathNames: string[];
  city?: string;
  project?: string;
  phase?: string;
  sector?: string;
  block?: string;
  area?: string;
} {
  const path = pathTo(nodes, listing.locationId);
  const names = path.map((n) => n.name);
  const city = path.find((n) => n.level === "city")?.name;
  const area = path.find((n) => n.level === "area")?.name;
  const project = path.find((n) => n.level === "project")?.name;
  const phase = path.find((n) => n.level === "phase")?.name;
  const sector = path.find((n) => n.level === "sector")?.name;
  const block = path.find((n) => n.level === "block")?.name;
  return { path, pathNames: names, city, area, project, phase, sector, block };
}
