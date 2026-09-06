import { loadDb } from "@/lib/db/local-db";
import { childrenOf, pathTo, levelLabel, nodeById } from "@/lib/data/hierarchy";
import type { LocationLevel } from "@/lib/data/types";
import { addLocationAction, deleteLocationAction, renameLocationAction } from "../actions";

const LEVELS: LocationLevel[] = ["country", "province", "city", "area", "project", "phase", "sector", "block"];

export default async function AdminLocations({ searchParams }: { searchParams: Promise<{ node?: string }> }) {
  const { node } = await searchParams;
  const db = await loadDb();
  const nodes = db.locations;

  const current = node ? nodeById(nodes, node) : nodeById(nodes, "pk");
  const path = current ? pathTo(nodes, current.id) : [];
  const kids = current ? childrenOf(nodes, current.id) : nodes.filter((n) => !n.parentId);

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-ink">Location hierarchy</h1>
      <p className="mt-1 max-w-2xl text-sm text-mut">
        A relational tree: <b>country → province → city → area → society → phase → sector → block</b>. Each row
        stores only its parent id — the path is walked from the links, never stored as one text field.
      </p>

      {/* navigation into tree */}
      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-linesoft bg-white p-3 text-sm shadow-sm">
        <a href="/admin/locations" className="rounded-lg bg-cream px-2.5 py-1 font-bold text-emerald">Root</a>
        {path.map((n) => (
          <span key={n.id} className="flex items-center gap-2">
            <span className="text-mut">/</span>
            <a href={`/admin/locations?node=${n.id}`} className="rounded-lg bg-cream px-2.5 py-1 font-bold text-ink-soft hover:text-emerald">
              {n.name}
            </a>
          </span>
        ))}
        {current && <span className="ml-1 text-xs text-mut">· {levelLabel(current.level)}</span>}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* children list */}
        <div className="overflow-hidden rounded-2xl border border-linesoft bg-white shadow-sm">
          <div className="border-b border-linesoft bg-cream/50 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-mut">
            {current ? `Children of ${current.name}` : "Top level"}
          </div>
          {kids.length === 0 ? (
            <p className="p-5 text-sm text-mut">No children yet. Add a {current ? levelLabel(nextOf(current.level)) : "province"} below.</p>
          ) : (
            kids.map((k) => (
              <div key={k.id} className="flex items-center gap-3 border-b border-linesoft px-4 py-2.5 last:border-0">
                <span className="badge bg-cream text-[0.6rem] text-emerald">{levelLabel(k.level)}</span>
                <a href={`/admin/locations?node=${k.id}`} className="flex-1 font-semibold text-ink hover:text-emerald">
                  {k.name}
                </a>
                {/* rename */}
                <form action={renameLocationAction} className="flex items-center gap-1">
                  <input type="hidden" name="id" value={k.id} />
                  <input name="name" defaultValue={k.name} className="w-28 rounded-lg border border-line px-2 py-1 text-xs" />
                  <button className="rounded-lg bg-cream px-2 py-1 text-xs font-bold text-emerald">Rename</button>
                </form>
                <form action={deleteLocationAction}>
                  <input type="hidden" name="id" value={k.id} />
                  <button className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50">✕</button>
                </form>
              </div>
            ))
          )}
        </div>

        {/* add child */}
        <div className="h-max rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-emerald">Add a child node</h2>
          <p className="mb-3 mt-1 text-xs text-mut">
            {current ? `Under "${current.name}"` : "At the top of the tree (country)."}
          </p>
          <form action={addLocationAction} className="space-y-3">
            <input type="hidden" name="parentId" value={current?.id ?? ""} />
            <label className="block">
              <span className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wide text-mut">Level</span>
              <select name="level" defaultValue={current ? nextOf(current.level) : "province"} className="input">
                {LEVELS.map((l) => (
                  <option key={l} value={l} disabled={current ? l !== nextOf(current.level) : l !== "province"}>
                    {levelLabel(l)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wide text-mut">Name</span>
              <input required name="name" className="input" placeholder="e.g. Block B / Sector Z / Phase 9" />
            </label>
            <button className="btn btn-emerald w-full">Add {current ? levelLabel(nextOf(current.level)).toLowerCase() : "province"}</button>
          </form>
          <p className="mt-4 rounded-xl bg-cream p-3 text-xs text-mut">
            To build the working example, walk to <b>DHA Lahore → Phase 6</b> and add Sector A, then a Block, etc.
          </p>
        </div>
      </div>
    </div>
  );
}

function nextOf(l: LocationLevel): LocationLevel {
  const order: LocationLevel[] = ["country", "province", "city", "area", "project", "phase", "sector", "block"];
  const i = order.indexOf(l);
  return order[i + 1] ?? order[order.length - 1];
}
