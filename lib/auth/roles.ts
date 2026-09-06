/**
 * ADMIN ROLES + permissions
 * -------------------------
 * Role is stored in the Supabase user's `app_metadata.role` (set on account
 * creation server-side so a user can never self-escalate) and mirrored in the
 * `profiles` table for Row Level Security (see supabase/sql/auth.sql). The UI
 * uses these constants for nav + guard messaging; middleware enforces it at the
 * route level; RLS enforces it at the data level (defense in depth).
 *
 * Roles:
 *   super_admin — platform owner: everything incl. managing admin/agent roles.
 *   admin       — operations: listings, projects, locations, features, content,
 *                 leads; CANNOT manage other admins/agents or roles.
 *   agent       — field advisor: dashboard + their own leads only.
 */

export type AdminRole = "super_admin" | "admin" | "agent";

export const ADMIN_ROLES: AdminRole[] = ["super_admin", "admin", "agent"];

export const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  agent: "Agent",
};

export function isAdminRole(v: unknown): v is AdminRole {
  return typeof v === "string" && (ADMIN_ROLES as string[]).includes(v);
}

/** Internal section ids used to drive the admin nav + guards. */
export type AdminSection =
  | "dashboard" | "listings" | "add" | "leads" | "agents" | "projects"
  | "locations" | "features" | "content";

export const ALL_SECTIONS: AdminSection[] = [
  "dashboard", "listings", "add", "leads", "agents", "projects",
  "locations", "features", "content",
];

const SECTION_FOR_ADMIN: AdminSection[] = [
  "dashboard", "listings", "add", "leads", "projects", "locations", "features", "content",
];
const SECTION_FOR_AGENT: AdminSection[] = ["dashboard", "leads"];

/** Whether a role may access an admin section. */
export function canAccessSection(role: AdminRole, section: AdminSection): boolean {
  if (role === "super_admin") return true;
  if (role === "admin") return SECTION_FOR_ADMIN.includes(section);
  return SECTION_FOR_AGENT.includes(section);
}

/** Whether a role may perform a privileged (agent/role-management) action. */
export function canManageAgents(role: AdminRole): boolean {
  return role === "super_admin";
}
