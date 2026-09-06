import { redirect } from "next/navigation";
import { isLocalMode } from "@/lib/env";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isAdminRole, canManageAgents, type AdminRole } from "./roles";

/**
 * Server-side admin session helpers.
 *
 *  - When Supabase Auth is configured (not local demo) the session comes from
 *    the signed-in user's cookies; the role is read from `app_metadata.role`.
 *  - In local demo mode there is no backend, so we return a synthetic
 *    "super_admin" session so the (already open) admin panel keeps working.
 *
 * The service-role key is never involved here — only the request-scoped,
 * cookie-authenticated client (RLS-aware).
 */
export const adminAuthEnabled = !isLocalMode;

export interface AdminSession {
  role: AdminRole;
  email?: string;
  name?: string;
  userId?: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!adminAuthEnabled) {
    // Local/demo: an authenticated super-admin is assumed for preview/dev.
    return { role: "super_admin", name: "Local Demo Admin", email: "demo@manzil.pk" };
  }
  const sb = await getSupabaseServer();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return null;
  const meta = (data.user.app_metadata ?? {}) as Record<string, unknown>;
  const role: AdminRole = isAdminRole(meta.role) ? meta.role : "agent";
  const umeta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    role,
    email: data.user.email ?? undefined,
    name: typeof umeta.name === "string" ? umeta.name : undefined,
    userId: data.user.id,
  };
}

/**
 * Server-side guard for the agent-management screens (/admin/agents/*).
 * Enforced even if middleware is bypassed (defence in depth): non-super-admins
 * are redirected to the dashboard. In local mode the demo session is a
 * super_admin, so these screens stay reachable for preview/dev.
 */
export async function requireCanManageAgents(): Promise<AdminSession> {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  if (!canManageAgents(s.role)) redirect("/admin");
  return s;
}
