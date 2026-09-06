import Link from "next/link";
import { loadDb } from "@/lib/db/local-db";
import { deleteAgentAction } from "../actions";
import { requireCanManageAgents } from "@/lib/auth/session";

export const metadata = { title: "Agents · Admin", robots: { index: false } };

export default async function AgentsAdminPage() {
  await requireCanManageAgents(); // only a Super Admin manages agents
  const db = await loadDb();
  const agents = db.agents;
  const propCount = (id: string) => (db.agents.find((a) => a.id === id)?.assignedListingIds ?? []).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink">Agents</h1>
          <p className="mt-1 text-mut">Manage advisors, their contact details, bio, specialisation and assigned properties.</p>
        </div>
        <Link href="/admin/agents/new" className="btn btn-emerald">+ Add agent</Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((a) => (
          <div key={a.id} className="rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              {a.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.photo} alt={a.name} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald text-lg font-bold text-white">{a.initials}</div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-bold text-ink">
                  {a.name}
                  {a.active !== false ? <span className="badge bg-emerald/10 text-emerald">Active</span> : <span className="badge bg-stone-200 text-stone-600">Inactive</span>}
                </div>
                <div className="text-sm text-mut">{a.role}</div>
              </div>
            </div>

            {a.specialization && <div className="mt-3 text-sm text-ink-soft"><b>Specialises:</b> {a.specialization}</div>}
            {a.bio && <p className="mt-1 line-clamp-2 text-sm text-mut">{a.bio}</p>}
            {a.cities?.length > 0 && <div className="mt-2 text-xs text-mut">Serves: {a.cities.join(", ")}</div>}

            <div className="mt-3 space-y-1 border-t border-linesoft pt-3 text-sm text-ink-soft">
              <div>{a.phone}</div>
              <div className="truncate">{a.email}</div>
              <div className="text-mut">{propCount(a.id)} assigned propert{propCount(a.id) === 1 ? "y" : "ies"}</div>
            </div>

            <div className="mt-3 flex gap-2">
              <Link href={`/admin/agents/${a.id}`} className="btn btn-ghost btn-sm flex-1">Edit</Link>
              <form action={deleteAgentAction}>
                <input type="hidden" name="id" value={a.id} />
                <button className="btn btn-sm border border-red-200 text-red-600 hover:bg-red-50">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
