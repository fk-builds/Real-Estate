import Link from "next/link";
import Image from "next/image";
import { loadDb } from "@/lib/db/local-db";
import { setListingField, deleteListingAction } from "../actions";
import { kindLabels, statusLabel } from "@/lib/site";
import { cx } from "@/lib/utils";

export default async function AdminListings() {
  const db = await loadDb();
  const rows = [...db.listings].sort((a, b) => Number(b.published !== false) - Number(a.published !== false) || b.views - a.views);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink">Properties</h1>
          <p className="mt-1 text-mut">{db.listings.length} total</p>
        </div>
        <Link href="/admin/listings/new" className="btn btn-emerald">+ Add property</Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-linesoft bg-white shadow-sm">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-cream/50 text-left text-xs font-bold uppercase tracking-wide text-mut">
              <th className="p-3">Property</th>
              <th className="p-3">Location</th>
              <th className="p-3">Price</th>
              <th className="p-3">Views</th>
              <th className="p-3 text-center">Live</th>
              <th className="p-3 text-center">Featured</th>
              <th className="p-3 text-center">Verified</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const live = l.published !== false;
              return (
                <tr key={l.id} className={cx("border-b border-linesoft last:border-0", !live && "bg-red-50/40")}>
                  <td className="p-3">
                    <Link href={`/admin/listings/${l.id}`} className="flex items-center gap-3">
                      <div className="relative h-12 w-16 flex-none overflow-hidden rounded-lg">
                        <Image src={l.coverImage} alt="" fill className="object-cover" sizes="64px" />
                      </div>
                      <div>
                        <div className="max-w-[240px] truncate font-bold text-ink hover:text-emerald">{l.title}</div>
                        <div className="text-xs text-mut">{kindLabels[l.kind]} · {statusLabel(l.status) || "Available"}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="p-3 text-[0.85rem] text-body">
                    {[l.phase, l.sector, l.block].filter(Boolean).join(" · ") || l.areaLabel}
                  </td>
                  <td className="p-3 font-semibold text-ink">{l.priceDisplay}</td>
                  <td className="p-3 text-mut">{l.views}</td>
                  <td className="p-3 text-center">
                    <form action={setListingField}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="field" value="published" />
                      <button className={cx("h-6 w-12 rounded-full transition", live ? "bg-emerald" : "bg-line")} aria-label="Toggle published">
                        <span className={cx("block h-5 w-5 -translate-x-0 rounded-full bg-white transition", live ? "translate-x-6" : "translate-x-0.5")} />
                      </button>
                    </form>
                  </td>
                  <td className="p-3 text-center">
                    <form action={setListingField}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="field" value="featured" />
                      <button className={cx("rounded-full px-3 py-1 text-xs font-bold transition", l.featured ? "bg-gold text-white" : "bg-cream text-mut")}>
                        {l.featured ? "★ Featured" : "☆ Feature"}
                      </button>
                    </form>
                  </td>
                  <td className="p-3 text-center">
                    <form action={setListingField}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="field" value="verified" />
                      <button className={cx("rounded-full px-3 py-1 text-xs font-bold transition", l.verified ? "bg-emerald text-white" : "bg-cream text-mut")}>
                        {l.verified ? "✓ Verified" : "Verify"}
                      </button>
                    </form>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <a href={`/property/${l.slug}`} target="_blank" className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-bold text-ink-soft hover:text-emerald" title="View on site">View</a>
                      <Link href={`/admin/listings/${l.id}`} className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-bold text-ink-soft hover:text-emerald">Edit</Link>
                      <form action={deleteListingAction}>
                        <input type="hidden" name="id" value={l.id} />
                        <button className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
