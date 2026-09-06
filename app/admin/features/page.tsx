import { loadDb } from "@/lib/db/local-db";
import { FEATURE_CATEGORIES } from "@/lib/data/features";
import { addFeatureAction, updateFeatureAction, deleteFeatureAction } from "../actions";

export default async function AdminFeatures() {
  const db = await loadDb();
  // count usages for context
  const usage = new Map<string, number>();
  for (const l of db.listings) for (const k of l.featureKeys ?? []) usage.set(k, (usage.get(k) ?? 0) + 1);

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-ink">Feature dictionary</h1>
      <p className="mt-1 max-w-2xl text-sm text-mut">
        A scalable tag system — features are data, not code. Add, rename or remove tags here and they update the
        listing form, filters and property pages automatically. In production these rows map to the
        <code className="mx-1 rounded bg-cream px-1 py-0.5">property_features</code> table.
      </p>

      {/* add */}
      <form action={addFeatureAction} className="mt-6 flex max-w-2xl flex-wrap items-end gap-3 rounded-2xl border border-linesoft bg-white p-4 shadow-sm">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-mut">New feature label</span>
          <input required name="label" className="input" placeholder="e.g. Rooftop Solar" />
        </label>
        <label className="w-52">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-mut">Category</span>
          <select name="category" defaultValue="Amenities" className="input">
            {FEATURE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-emerald">Add feature</button>
      </form>

      {/* grouped list */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {FEATURE_CATEGORIES.map((cat) => {
          const list = db.features.filter((f) => f.category === cat);
          if (!list.length) return null;
          return (
            <div key={cat} className="rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
              <div className="mb-3 text-sm font-extrabold uppercase tracking-widest text-emerald">{cat}</div>
              <div className="space-y-2">
                {list.map((f) => (
                  <form key={f.key} action={updateFeatureAction} className="flex items-center gap-2">
                    <input type="hidden" name="key" value={f.key} />
                    <input name="label" defaultValue={f.label} className="w-44 rounded-lg border border-line px-2.5 py-1.5 text-sm" />
                    <select name="category" defaultValue={f.category} className="rounded-lg border border-line px-1 py-1.5 text-xs">
                      {FEATURE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <span className="whitespace-nowrap text-xs text-mut">used ×{usage.get(f.key) ?? 0}</span>
                    <button className="ml-auto rounded-lg bg-cream px-2.5 py-1.5 text-xs font-bold text-emerald">Save</button>
                    <button formAction={deleteFeatureAction} className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">✕</button>
                  </form>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
