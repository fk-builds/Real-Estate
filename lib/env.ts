import { z } from "zod";

/**
 * Validated environment access. Reading env anywhere else goes through here
 * so a misconfigured deploy fails loudly at startup instead of at runtime.
 */

const publicEnv = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

const serverEnv = z.object({
  DATA_PROVIDER: z.enum(["local", "supabase"]).default("local"),
  MEDIA_PROVIDER: z.enum(["supabase", "cloudinary", "s3"]).default("supabase"),
  SEARCH_PROVIDER: z.enum(["postgres", "meilisearch", "algolia"]).default("postgres"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_BUCKET: z.string().default("manzil"),
  MEILISEARCH_HOST: z.string().optional(),
  MEILISEARCH_KEY: z.string().optional(),
});

export const publicConfig = publicEnv.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const serverConfig = serverEnv.parse({
  DATA_PROVIDER: process.env.DATA_PROVIDER,
  MEDIA_PROVIDER: process.env.MEDIA_PROVIDER,
  SEARCH_PROVIDER: process.env.SEARCH_PROVIDER,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_BUCKET: process.env.NEXT_PUBLIC_SUPABASE_BUCKET,
  MEILISEARCH_HOST: process.env.MEILISEARCH_HOST,
  MEILISEARCH_KEY: process.env.MEILISEARCH_KEY,
});

/** True when we should read from seeded local data (no live backend). */
export const isLocalMode =
  serverConfig.DATA_PROVIDER === "local" ||
  !publicConfig.NEXT_PUBLIC_SUPABASE_URL ||
  !publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
