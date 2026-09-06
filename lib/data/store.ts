import type {
  Listing,
  Project,
  CityOption,
  SearchFilters,
  SearchOptions,
  SearchResult,
} from "./types";

/**
 * Store — the single data-access seam for listing/project reads.
 *
 * Implementations:
 *  - LocalStore      (seed data, no backend)         -> used for preview / UI work
 *  - SupabaseStore   (PostgreSQL via Supabase)
 *
 * Search ranking is deliberately kept OUT of the Store (see services/search)
 * so it can be swapped to Meilisearch / Algolia independently.
 */
export interface Store {
  readonly name: "local" | "supabase";
  search(filters: SearchFilters, opts?: SearchOptions): Promise<SearchResult>;
  getBySlug(slug: string): Promise<Listing | null>;
  getById(id: string): Promise<Listing | null>;
  getBySlugs(ids: string[]): Promise<Listing[]>;
  getFeatured(count?: number): Promise<Listing[]>;
  getProjects(): Promise<Project[]>;
  getCities(): Promise<CityOption[]>;
  getRelated(to: Listing, count?: number): Promise<Listing[]>;
}
