import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicConfig, serverConfig } from "@/lib/env";

/**
 * Service-role Supabase client. SERVER ONLY — never import into a Client
 * Component or use outside Route Handlers / Server Components / RPC triggers.
 * Bypasses RLS (used by admin, seeding and server data access).
 */
let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = publicConfig.NEXT_PUBLIC_SUPABASE_URL;
  const key = serverConfig.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!_admin) {
    _admin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _admin;
}
