import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicConfig } from "@/lib/env";

/**
 * Request-scoped Supabase client using the user's session cookies (RLS-aware).
 * Use in Server Components / Route Handlers / middleware when you need the
 * signed-in user's permissions rather than the service role.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  const url = publicConfig.NEXT_PUBLIC_SUPABASE_URL;
  const anon = publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase is not configured.");
  }
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: unknown }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]),
          );
        } catch {
          // Called from a Server Component where cookies are read-only — safe to ignore.
        }
      },
    },
  });
}
