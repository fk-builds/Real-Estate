import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession, adminAuthEnabled } from "@/lib/auth/session";
import { canAccessSection, ROLE_LABEL, type AdminRole, type AdminSection } from "@/lib/auth/roles";
import { logoutAction } from "./actions";
import { AdminMobileNav, type AdminNavItem } from "@/components/admin/admin-nav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const NAV: Array<{ section: AdminSection; href: string; label: string }> = [
  { section: "dashboard", href: "/admin", label: "Dashboard" },
  { section: "listings", href: "/admin/listings", label: "Properties" },
  { section: "add", href: "/admin/listings/new", label: "+ Add Property" },
  { section: "leads", href: "/admin/leads", label: "Leads" },
  { section: "agents", href: "/admin/agents", label: "Agents" },
  { section: "projects", href: "/admin/projects", label: "Projects" },
  { section: "locations", href: "/admin/locations", label: "Locations" },
  { section: "features", href: "/admin/features", label: "Features" },
  { section: "content", href: "/admin/content", label: "Website content" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Protect the whole admin area.
  const session = await getAdminSession();
  if (adminAuthEnabled && !session) redirect("/admin/login");

  const role: AdminRole = session?.role ?? "super_admin";
  const nav: AdminNavItem[] = NAV.filter((n) => canAccessSection(role, n.section)).map((n) => ({
    href: n.href,
    label: n.label,
  }));

  return (
    <div className="min-h-screen bg-cream2">
      {/* Mobile/tablet: slim top bar + left slide-in drawer */}
      <AdminMobileNav items={nav} />

      <div className="mx-auto max-w-7xl lg:flex lg:gap-6 lg:px-6 lg:py-8">
        {/* Desktop: persistent LEFT sidebar column */}
        <aside className="hidden h-max shrink-0 rounded-2xl border border-linesoft bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:block lg:w-60">
          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-mut">Admin Panel</span>
            <span className="rounded-full bg-emerald/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald">
              {ROLE_LABEL[role]}
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-cream2 hover:text-emerald"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          {!adminAuthEnabled && (
            <div className="mt-3 rounded-xl bg-cream px-3 py-2 text-[0.7rem] leading-snug text-mut">
              Owner view — you have full control here. (Local demo)
            </div>
          )}
          <div className="mt-4 flex flex-col gap-1 border-t border-linesoft pt-4">
            {session?.email && <div className="px-3 pb-1 text-xs text-mut">{session.email}</div>}
            <form action={logoutAction}>
              <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50">
                Sign out
              </button>
            </form>
            <Link href="/" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-emerald hover:underline">
              ← Back to site
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 lg:py-0 py-6">{children}</div>
      </div>
    </div>
  );
}
