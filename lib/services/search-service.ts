import type { Store } from "@/lib/data/store";
import type { SearchFilters, SearchOptions, SearchResult } from "@/lib/data/types";
import { serverConfig } from "@/lib/env";

/**
 * SEARCH ABSTRACTION
 * ------------------
 * `SearchAdapter` hides which engine powers discovery. Pages and filters only
 * ever talk to this interface.
 *
 *   provider="postgres"     -> PostgreSQL full-text search (current default)
 *   provider="meilisearch"  -> swap to Meilisearch by dropping in an adapter
 *   provider="algolia"      -> swap to Algolia InstantSearch-ready adapter
 *
 * When a Meilisearch/Algolia adapter returns only matching IDs, the hydrated
 * `Listing` documents come from the Store so the UI layer is untouched.
 */
export interface SearchAdapter {
  readonly provider: "postgres" | "meilisearch" | "algolia";
  search(filters: SearchFilters, opts?: SearchOptions): Promise<SearchResult>;
}

/** Default + fallback: PostgreSQL FTS via the Store's SQL search function. */
class PostgresSearchAdapter implements SearchAdapter {
  readonly provider = "postgres" as const;
  constructor(private store: Store) {}
  search(f: SearchFilters, o?: SearchOptions) {
    return this.store.search(f, o);
  }
}

/**
 * Meilisearch adapter — activate by setting SEARCH_PROVIDER=meilisearch and
 * MEILISEARCH_HOST/KEY. Returns matched slugs/ids, then hydrates via the store.
 */
class MeilisearchAdapter implements SearchAdapter {
  readonly provider = "meilisearch" as const;
  constructor(private store: Store, private host: string, private key: string) {}

  async search(f: SearchFilters, o: SearchOptions = {}): Promise<SearchResult> {
    const { page = 1, pageSize = 12 } = o;
    const filter = [] as string[];
    if (f.purpose) filter.push(`purpose = ${f.purpose}`);
    if (f.kind) filter.push(`kind = ${f.kind}`);
    if (f.citySlug) filter.push(`city = ${f.citySlug}`);

    const res = await fetch(`${this.host}/indexes/listings/search`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        q: f.q ?? "",
        filter,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        sort: o.sort === "price_asc" ? ["price:asc"] : ["featured:desc"],
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Meilisearch error ${res.status}`);
    const json = (await res.json()) as { hits: Array<{ id: string }>; totalHits: number };
    const items = (
      await Promise.all(json.hits.map((h) => this.store.getById(String(h.id))))
    ).filter((x): x is NonNullable<typeof x> => Boolean(x));
    return {
      items,
      total: json.totalHits,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(json.totalHits / pageSize)),
    };
  }
}

/** Algolia adapter — activate with NEXT_PUBLIC_ALGOLIA_* + ALGOLIA_ADMIN_KEY. */
class AlgoliaSearchAdapter implements SearchAdapter {
  readonly provider = "algolia" as const;
  constructor(private store: Store, private appId: string, private apiKey: string, private indexName: string) {}

  async search(f: SearchFilters, o: SearchOptions = {}): Promise<SearchResult> {
    const res = await fetch(
      `https://${this.appId}-dsn.algolia.net/1/indexes/${this.indexName}/query`,
      {
        method: "POST",
        headers: {
          "X-Algolia-Application-Id": this.appId,
          "X-Algolia-API-Key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: f.q ?? "",
          filters: algoliaFilters(f),
          hitsPerPage: o.pageSize ?? 12,
          page: (o.page ?? 1) - 1,
        }),
        cache: "no-store",
      },
    );
    if (!res.ok) throw new Error(`Algolia error ${res.status}`);
    const json = (await res.json()) as { hits: Array<{ id: string }>; nbHits: number };
    const items = (
      await Promise.all(json.hits.map((h) => this.store.getById(String(h.id))))
    ).filter((x): x is NonNullable<typeof x> => Boolean(x));
    return {
      items,
      total: json.nbHits,
      page: o.page ?? 1,
      pageSize: o.pageSize ?? 12,
      totalPages: Math.max(1, Math.ceil(json.nbHits / (o.pageSize ?? 12))),
    };
  }
}

function algoliaFilters(f: SearchFilters): string {
  const parts: string[] = [];
  if (f.purpose) parts.push(`purpose:${f.purpose}`);
  if (f.kind) parts.push(`kind:${f.kind}`);
  if (f.citySlug) parts.push(`city:${f.citySlug}`);
  return parts.join(" AND ");
}

/**
 * Factory. Defaults to Postgres; logs + falls back when an engine isn't
 * configured. Only call within Server Components / Route Handlers.
 */
export function getSearchAdapter(store: Store): SearchAdapter {
  switch (serverConfig.SEARCH_PROVIDER) {
    case "meilisearch":
      if (serverConfig.MEILISEARCH_HOST && serverConfig.MEILISEARCH_KEY) {
        return new MeilisearchAdapter(store, serverConfig.MEILISEARCH_HOST, serverConfig.MEILISEARCH_KEY);
      }
      break;
    case "algolia":
      if (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_KEY) {
        return new AlgoliaSearchAdapter(
          store,
          process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
          process.env.ALGOLIA_ADMIN_KEY,
          "listings",
        );
      }
      break;
  }
  return new PostgresSearchAdapter(store);
}
