import { redirect } from "next/navigation";
import { getAdminSession, adminAuthEnabled, type AdminSession } from "./session";
import { isContentManager, mayManageAgents, mayOperateLead } from "./policy";

/**
 * AUTHORIZE — server-side access control (defence in depth).
 *
 * Middleware + the admin nav only hide/redirect controls in the browser; they
 * are NOT trust boundaries. Every mutation that writes data must pass through
 * here so that a crafted request (curl, tampered form, replayed action id) is
 * still rejected on the server even if the UI would never show it.
 *
 * These rules mirror the RLS policies in supabase/sql/rls.sql (single policy
 * source of truth for what each role may do to each row):
 *
 *   Role        Read public site   Manage content*    Manage leads     Manage agents
 *   ────────────────────────────────────────────────────────────────────────────────
 *   anon        published only     ✗                  ✗                ✗
 *   super_admin all                ✓ (any)            ✓ (any)          ✓ (only role)
 *   admin       all                ✓ (any)            ✓ (any)          ✗
 *   agent       published only     ✗                  ✓ own assigned   ✗
 *
 *   * content = listings, projects, cities, locations, features, cms.
 *
 * In local demo mode the session is a synthetic `super_admin`, so these guards
 * pass — the seeded preview/admin stays usable. When Supabase Auth is enabled
 * they read the real signed-in role and become fully enforced.
 */

export type ContentKind = "listing" | "project" | "city" | "location" | "feature" | "cms";

/* --------------------------------------------------------------------- *
 * Server action guards (throw on denial; caller becomes a 4xx/redirect).
 * --------------------------------------------------------------------- */

export class AuthorizationError extends Error {
  constructor(message: string, readonly status = 403) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** Resolve the acting session, redirecting to login when it is missing. */
async function actingSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    if (adminAuthEnabled) redirect("/admin/login"); // unauth in a live env
    throw new AuthorizationError("Not authenticated", 401);
  }
  return session;
}

/** Require a content-manager (super_admin | admin) for content CRUD. */
export async function requireContentManager(kind?: ContentKind): Promise<AdminSession> {
  const session = await actingSession();
  if (!isContentManager(session.role)) {
    throw new AuthorizationError(
      `Forbidden: role "${session.role}" may not ${kind ? `manage ${kind}s` : "manage content"}. ` +
      "This action is restricted to Super Admin / Admin and is enforced server-side.",
    );
  }
  return session;
}

/** Require super_admin for agent (and role/assignment) management. */
export async function requireSuperAdmin(): Promise<AdminSession> {
  const session = await actingSession();
  if (!mayManageAgents(session.role)) {
    throw new AuthorizationError(
      "Forbidden: only a Super Admin may manage agents. Enforced server-side.",
    );
  }
  return session;
}

/**
 * Require permission to operate a lead. Admin/super_admin may act on any lead;
 * an agent may act ONLY on a lead assigned to them. Pass the lead's
 * `assignedUserId` (the auth account it is owned by) and the caller resolves
 * via the session.
 */
export async function requireLeadAccess(assignedUserId?: string | null): Promise<AdminSession> {
  const session = await actingSession();
  if (!mayOperateLead(session.role, assignedUserId, session.userId ?? null)) {
    throw new AuthorizationError(
      `Forbidden: role "${session.role}" may only operate leads assigned to them. Enforced server-side.`,
    );
  }
  return session;
}
