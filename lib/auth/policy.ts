import { canManageAgents, type AdminRole } from "./roles";

/**
 * POLICY — pure, side-effect-free access-control rules (no I/O, no Next/Supabase
 * imports) so they are trivially unit-testable and kept as the exact mirror of
 * the RLS policies in supabase/sql/rls.sql.
 *
 * Do the actual server checks via lib/auth/authorize.ts, which calls these after
 * resolving the acting session — never trust the frontend.
 */

const CONTENT_MANAGER_ROLES: AdminRole[] = ["super_admin", "admin"];

/** super_admin or admin may manage content (listings, locations, projects…). */
export function isContentManager(role: AdminRole): boolean {
  return CONTENT_MANAGER_ROLES.includes(role);
}

/**
 * May `role` operate on a lead? Admins may operate any lead; an agent may only
 * operate a lead explicitly assigned to their own auth account.
 */
export function mayOperateLead(
  role: AdminRole,
  assignedUserId?: string | null,
  callerUserId?: string | null,
): boolean {
  if (isContentManager(role)) return true;
  if (role !== "agent") return false; // anon / unknown roles never touch leads
  if (!callerUserId || !assignedUserId) return false;
  return assignedUserId === callerUserId;
}

/** super_admin only may manage the agent directory / roles / assignments. */
export function mayManageAgents(role: AdminRole): boolean {
  return canManageAgents(role);
}

/** The public site may only surface published, live listings. */
export function mayPubliclyReadListing(
  published: boolean | null | undefined,
  status?: string | null,
): boolean {
  if (published === false) return false;
  const st = (status ?? "").toLowerCase();
  return !["draft", "archived", "hidden", "sold", "rented", "pending"].includes(st);
}
