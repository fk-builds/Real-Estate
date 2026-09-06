import Link from "next/link";
import Image from "next/image";
import { loadDb } from "@/lib/db/local-db";
import { deleteProjectAction, saveProjectAction } from "../actions";

export default async function AdminProjects() {
  const db = await loadDb();

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-ink">Projects & developments</h1>
      <p className="mt-1 text-mut">Manage societies, towers and schemes shown under "New Developments".</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* list */}
        <div className="overflow-hidden rounded-2xl border border-linesoft bg-white shadow-sm">
          {db.projects.map((p) => (
            <div key={p.id} className="flex items-center gap-4 border-b border-linesoft p-4 last:border-0">
              <div className="relative h-16 w-24 flex-none overflow-hidden rounded-lg">
                <Image src={p.image} alt="" fill className="object-cover" sizes="96px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-bold text-ink">{p.name}</span>
                  {p.featured && <span className="badge badge-sale">★ FEATURED</span>}
                </div>
                <div className="text-xs capitalize text-mut">{p.category} · {p.status} · {p.location}</div>
                <div className="text-sm text-emerald">{p.priceFrom && `From ${p.priceFrom}`} · {p.units}</div>
              </div>
              <form action={deleteProjectAction} className="flex-none">
                <input type="hidden" name="id" value={p.id} />
                <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button>
              </form>
            </div>
          ))}
        </div>

        {/* quick add / edit panel */}
        <div className="h-max rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-emerald">Add / update project</h2>
          <p className="mb-3 mt-1 text-xs text-mut">Leave ID blank to create a new project.</p>
          <form action={saveProjectAction} className="space-y-3 text-sm">
            <input className="input" name="id" placeholder="ID (blank = new)" />
            <input required className="input" name="name" placeholder="Project name" />
            <input className="input" name="slug" placeholder="Slug (optional)" />
            <input className="input" name="category" placeholder="Category (e.g. Gated Community)" />
            <select className="input" name="status" defaultValue="booking">
              <option value="pre_launch">Pre-launch</option>
              <option value="booking">Booking</option>
              <option value="possession">Possession</option>
              <option value="sold_out">Sold out</option>
            </select>
            <input className="input" name="location" placeholder="Location (city / area)" />
            <input className="input" name="priceFrom" placeholder="From price e.g. PKR 38 Lakh" />
            <input className="input" name="units" placeholder="Units e.g. 5 Marla – 1 Kanal" />
            <input className="input" name="image" placeholder="Cover image URL" />
            <textarea className="input" name="description" rows={3} placeholder="Description" />
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <input type="checkbox" name="featured" className="h-4 w-4 accent-gold-deep" /> Featured
            </label>
            <button className="btn btn-emerald w-full">Save project</button>
          </form>
        </div>
      </div>
    </div>
  );
}
