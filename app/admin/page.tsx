import Link from "next/link";
import { loadDb } from "@/lib/db/local-db";
import { isPlotKind } from "@/lib/data/types";
import { LEAD_STATUS_CLASS, LEAD_STATUS_LABEL } from "@/lib/data/leads";
import { resetDataAction } from "./actions";

export default async function AdminDashboard() {
  const db = await loadDb();

  const live = db.listings.filter((l) => l.published !== false);
  const available = live.filter((l) => l.status === "available" || l.status === "under_offer" || l.status === "reserved");
  const sold = db.listings.filter((l) => l.status === "sold" || l.status === "rented");
  const rented = db.listings.filter((l) => l.status === "rented" || l.purpose === "rent");
  const featured = db.listings.filter((l) => l.featured);
  const verified = db.listings.filter((l) => l.verified);
  const totalViews = db.listings.reduce((sum, l) => sum + (l.views ?? 0), 0);
  const leads = db.leads;

  const stat = (label: string, value: number | string, href?: string, accent = "text-emerald") => (
    <Link href={href ?? "#"} className="rounded-2xl border border-linesoft bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`font-serif text-3xl font-bold ${accent}`}>{value}</div>
      <div className="mt-1 text-sm font-semibold text-ink-soft">{label}</div>
    </Link>
  );

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-1 text-mut">Overview and management for the whole marketplace.</p>

      {/* overview cards */}
      <h2 className="mt-7 font-serif text-lg font-semibold text-ink">Property overview</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stat("Total properties", db.listings.length, "/admin/listings")}
        {stat("Available", available.length, "/admin/listings")}
        {stat("Sold", sold.length, "/admin/listings")}
        {stat("Rented", rented.length, "/admin/listings")}
        {stat("Featured", featured.length, "/admin/listings", "text-gold-deep")}
        {stat("Verified", verified.length, "/admin/listings")}
        {stat("Total leads", leads.length, "/admin/leads", "text-blue-600")}
        {stat("Total views", totalViews.toLocaleString(), "/admin/listings", "text-purple-600")}
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        {/* quick actions */}
        <div className="rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-ink">Quick actions</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            <Link href="/admin/listings/new" className="btn btn-emerald">+ Add a property</Link>
            <Link href="/admin/leads" className="btn btn-ghost">Manage leads ({leads.filter((l) => l.status === "new").length} new)</Link>
            <Link href="/admin/agents" className="btn btn-ghost">Manage agents ({db.agents.length})</Link>
            <Link href="/admin/locations" className="btn btn-ghost">Manage locations (city → block)</Link>
            <Link href="/admin/projects" className="btn btn-ghost">Manage projects & developments</Link>
          </div>
        </div>

        {/* recent leads */}
        <div className="rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-ink">Recent enquiries</h2>
            <Link href="/admin/leads" className="text-sm font-bold text-emerald hover:underline">All leads →</Link>
          </div>
          {leads.length === 0 ? (
            <p className="mt-4 text-sm text-mut">No leads yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-line">
              {[...leads].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate font-bold text-ink">{l.name}</div>
                    <div className="truncate text-xs text-mut">{l.listingTitle ?? "General enquiry"} · {l.phone}</div>
                  </div>
                  <span className={`badge shrink-0 ${LEAD_STATUS_CLASS[l.status]}`}>{LEAD_STATUS_LABEL[l.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* status bands */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
          <div className="text-xs font-extrabold uppercase tracking-wide text-mut">By status</div>
          <div className="mt-3 space-y-2 text-sm">
            {(["available", "sold", "rented", "reserved", "under_offer"] as const).map((s) => (
              <div key={s} className="flex items-center justify-between">
                <span className="capitalize text-ink-soft">{s.replace("_", " ")}</span>
                <span className="font-bold text-ink">{db.listings.filter((l) => l.status === s).length}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
          <div className="text-xs font-extrabold uppercase tracking-wide text-mut">By purpose</div>
          <div className="mt-3 space-y-2 text-sm">
            {(["sale", "rent", "lease"] as const).map((s) => (
              <div key={s} className="flex items-center justify-between">
                <span className="capitalize text-ink-soft">{s}</span>
                <span className="font-bold text-ink">{db.listings.filter((l) => l.purpose === s).length}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
          <div className="text-xs font-extrabold uppercase tracking-wide text-mut">By type</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-ink-soft">Houses & villas</span><span className="font-bold text-ink">{db.listings.filter((l) => l.kind === "house").length}</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-soft">Plots / land</span><span className="font-bold text-ink">{db.listings.filter((l) => isPlotKind(l.kind)).length}</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-soft">Apartments</span><span className="font-bold text-ink">{db.listings.filter((l) => l.kind === "apartment" || l.kind === "penthouse").length}</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-soft">Featured</span><span className="font-bold text-ink">{featured.length}</span></div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-ink">Data mode</h2>
        <p className="mt-2 text-sm text-body">
          Running in <b className="text-emerald">local mode</b> — changes persist to{" "}
          <code className="rounded bg-cream px-1.5 py-0.5 text-xs">data/db.json</code> and appear on the site immediately.
          Point <code className="rounded bg-cream px-1.5 py-0.5 text-xs">DATA_PROVIDER=supabase</code> to use PostgreSQL instead.
        </p>
        <form action={resetDataAction} className="mt-4">
          <button className="btn btn-light btn-sm border border-red-200 text-red-600 hover:bg-red-50">Reset sample data</button>
        </form>
      </div>
    </div>
  );
}
