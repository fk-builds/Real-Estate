import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getStore } from "@/lib/data/provider";

/**
 * Dynamic sitemap driven by the database/store: every listing and project
 * gets its own SEO-canonical URL. Served on ISR so new listings appear.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const store = await getStore();

  const [listings, projects] = await Promise.all([searchAll(store), store.getProjects()]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${base}/properties`, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/rent`, priority: 0.8, changeFrequency: "daily" },
    { url: `${base}/projects`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${base}/agents`, priority: 0.5 },
    { url: `${base}/sell`, priority: 0.6 },
  ];

  const listingEntries = listings.map((l) => ({
    url: `${base}/property/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const projectEntries = projects.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...listingEntries, ...projectEntries];
}

async function searchAll(store: Awaited<ReturnType<typeof getStore>>) {
  const out = [];
  const PAGE = 100;
  for (let page = 1; page <= 100; page++) {
    const res = await store.search({}, { page, pageSize: PAGE, sort: "newest" });
    out.push(...res.items);
    if (page >= res.totalPages) break;
  }
  return out;
}
