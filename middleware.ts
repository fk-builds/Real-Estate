import { NextResponse, type NextRequest } from "next/server";
import {
  createServerClient,
  type CookieOptions,
  type CookieMethodsServer,
} from "@supabase/ssr";
import { isLocalMode, publicConfig } from "@/lib/env";
import {
  canAccessSection, canManageAgents, isAdminRole,
  type AdminSection, type AdminRole,
} from "@/lib/auth/roles";

/**
 * AUTH MIDDLEWARE — protects the admin area.
 *
 * Enforcement only happens when Supabase Auth is configured (i.e. NOT local
 * demo mode). In local mode every request is allowed so the seeded admin /
 * demo stays usable without a backend. When enabled:
 *   1. requires a signed-in session (else redirect to /admin/login)
 *   2. authorizes the requested admin section against the user's role from
 *      `app_metadata.role` (route-level RBAC; data-level RBAC is RLS).
 *
 * The service-role key is never used here — only the public anon key inside the
 * createServerClient cookie handling, which is server-side only.
 */
const authEnabled =
  !isLocalMode &&
  Boolean(publicConfig.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const LOGIN = "/admin/login";
const ADMIN_ROUTE = "/admin";

/** Map a /admin/<segment> URL to its RBAC section ("" = the dashboard). */
function sectionForPathname(pathname: string): { seg: string; section?: AdminSection } {
  const seg = pathname.replace(ADMIN_ROUTE, "").split("/").filter(Boolean)[0] ?? "";
  const map: Record<string, AdminSection> = {
    listings: "listings", projects: "projects", locations: "locations",
    features: "features", content: "content", agents: "agents", leads: "leads",
  };
  return { seg, section: seg ? map[seg] : "dashboard" };
}

export async function middleware(request: NextRequest) {
  if (!authEnabled) return NextResponse.next();

  const res = NextResponse.next();
  const sb = createServerClient(
    publicConfig.NEXT_PUBLIC_SUPABASE_URL!,
    publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) => {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      } satisfies CookieMethodsServer,
    },
  );
  const { data } = await sb.auth.getUser();
  const user = data.user;

  const url = new URL(request.url);
  if (!user) {
    const loginUrl = new URL(LOGIN, request.url);
    loginUrl.searchParams.set("next", url.pathname + url.search);
    return NextResponse.redirect(loginUrl);
  }

  const role: AdminRole = isAdminRole(user.app_metadata?.role) ? user.app_metadata.role : "agent";
  const { seg, section } = sectionForPathname(url.pathname);
  if (section && !canAccessSection(role, section)) {
    return NextResponse.json({ error: "Forbidden: role does not permit this section" }, { status: 403 });
  }
  if (seg === "agents" && !canManageAgents(role)) {
    return NextResponse.json({ error: "Forbidden: only a Super Admin manages agents" }, { status: 403 });
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
