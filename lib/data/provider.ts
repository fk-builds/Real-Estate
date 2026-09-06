import { isLocalMode } from "@/lib/env";
import type { Store } from "./store";
import { LocalStore } from "./local-store";
import { SupabaseStore } from "./supabase-store";
import type { SearchFilters, SearchOptions, SearchResult } from "./types";
import { getSearchAdapter, type SearchAdapter } from "@/lib/services/search-service";

/**
 * Entry point for data. Every server page calls these helpers instead of
 * instantiating stores directly, so switching local <-> Supabase is a no-op
 * for the caller.
 *
 *   isLocalMode is true when DATA_PROVIDER=local OR Supabase env is absent.
 */
export async function getStore(): Promise<Store> {
  return isLocalMode ? new LocalStore() : new SupabaseStore();
}

export async function searchListings(
  filters: SearchFilters,
  opts?: SearchOptions,
): Promise<SearchResult> {
  const store = await getStore();
  const adapter: SearchAdapter = getSearchAdapter(store);
  return adapter.search(filters, opts);
}
