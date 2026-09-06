"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicConfig } from "@/lib/env";

/**
 * Browser Supabase client (anon key). Used for authenticated, RLS-protected
 * interactions from the client: lead submission, saved properties, auth forms,
 * and storage uploads. Singleton per browser session.
 */
let _browser: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  const url = publicConfig.NEXT_PUBLIC_SUPABASE_URL;
  const anon = publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).",
    );
  }
  if (!_browser) {
    _browser = createBrowserClient(url, anon);
  }
  return _browser;
}
