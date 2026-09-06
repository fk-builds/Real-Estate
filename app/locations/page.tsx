import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadDb } from "@/lib/db/local-db";
import { nodeById, childrenOf, pathTo, levelLabel, nextLevel } from "@/lib/data/hierarchy";
import type { LocationNode } from "@/lib/data/types";
import { ArrowRightIcon, PinIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Browse Locations — City, Society, Phase, Sector, Block",
  description: "Drill down Pakistan's property locations relationally: city → society → phase → sector → block.",
  alternates: { canonical: "/locations" },
};
export const dynamic = "force-dynamic";

type P = { searchParams: Promise<{ node?: string }> };

export default async function LocationsPage({ searchParams }: P) {
  const { node } = await searchParams;
  const db = await loadDb();
  const nodes = db.locations;

  const current = node ? nodeById(nodes, node) : nodeById(nodes, "pk");
  if (!current) notFound();
  const path = pathTo(nodes, current.id);
  const kids = childrenOf(nodes, current.id);
  const counts = countByNode(nodes, db.listings);
  const lower = nextLevel(current.level);

  return (
    <>
      <div className="bg-emerald-2 py-12 text-white">
        <div className="mx-auto max-w-7xl px-6">
          {/* relational breadcrumb (climbed via parent FK) */}
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-white/80">
            {path.map((n, i) => {
              const last = i === path.length - 1;
              return (
                <span key={n.id} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-white/40">/</span>}
                  {last ? (
                    <span className="font-bold text-white">{n.name}</span>
                  ) : (
                    <Link href={`/locations?node=${n.id}`} className="hover:underline hover:text-gold-2">{n.name}</Link>
                  )}
                </span>
              );
            })}
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge bg-white/15 text-white">{levelLabel(current.level)}</span>
            <h1 className="font-serif text-[clamp(1.9rem,3.6vw,2.8rem)] font-semibold">{current.name}</h1>
          </div>
          <p className="mt-1 text-white/80">
            {counts.get(current.id) ?? 0} properties in this area
            {lower ? ` · choose a ${lower.toLowerCase()} below` : ""}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {kids.length > 0 ? (
          <>
            {lower && (
              <div className="mb-6 flex items-center gap-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-mut">
                  {current.level === "country" ? "Choose a province" : `Choose ${levelLabel(lower).toLowerCase()}`}
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kids.map((k) => (
                <LocationCard key={k.id} node={k} count={counts.get(k.id) ?? 0} hasChildren={childrenOf(nodes, k.id).length > 0} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
            <div className="text-4xl">📍</div>
            <p className="mt-3 font-bold text-ink">This is the deepest location level.</p>
            <p className="mt-1 text-sm text-mut">Browse the properties listed in {current.name}.</p>
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-cream2 p-5 text-sm text-mut">
          <b className="text-emerald">How this works:</b> locations are stored as relational rows
          (country → province → city → area → society → phase → sector → block) linked by parent foreign
          keys. The breadcrumb and counts above are computed by walking those links — nothing is stored as a
          single concatenated text path.
        </div>
      </div>
    </>
  );
}

function LocationCard({ node, count, hasChildren }: { node: LocationNode; count: number; hasChildren: boolean }) {
  const sub = node.level === "block" ? "properties" : "browse";
  return (
    <Link
      href={hasChildren ? `/locations?node=${node.id}` : `/properties?q=${encodeURIComponent(node.name)}`}
      className="group flex items-center gap-4 rounded-2xl border border-linesoft bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald/30 hover:shadow-md"
    >
      <div className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-cream text-emerald">
        <PinIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-extrabold text-ink group-hover:text-emerald">{node.name}</div>
        <div className="text-xs font-semibold uppercase tracking-wide text-mut">
          {levelLabel(node.level)} · {count} properties
        </div>
      </div>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line text-ink-soft transition group-hover:border-emerald group-hover:text-emerald">
        <ArrowRightIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}

/** Subtree counts: climb each listing's locationId to its ancestors. */
function countByNode(nodes: LocationNode[], listings: Array<{ locationId?: string; published?: boolean }>): Map<string, number> {
  const map = new Map<string, number>();
  const parent = new Map(nodes.map((n) => [n.id, n.parentId]));
  const bump = (id: string) => map.set(id, (map.get(id) ?? 0) + 1);
  for (const l of listings) {
    if (l.published === false || !l.locationId) continue;
    const seen = new Set<string>();
    let cur: string | null = l.locationId;
    while (cur && !seen.has(cur)) {
      seen.add(cur);
      bump(cur);
      cur = parent.get(cur) ?? null;
    }
  }
  return map;
}
