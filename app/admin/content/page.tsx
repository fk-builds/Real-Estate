import { loadDb } from "@/lib/db/local-db";
import { saveCmsAction } from "../actions";

export default async function AdminContent() {
  const db = await loadDb();
  const entries = Object.entries(db.cms);

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-ink">Website content</h1>
      <p className="mt-1 text-mut">
        Edit the copy shown on the homepage. Changes publish instantly.
      </p>

      <form action={saveCmsAction} className="mt-6 max-w-2xl space-y-5">
        {entries.map(([key, value]) => {
          const multi = value.length > 90;
          return (
            <label key={key} className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mut">
                {key}
              </span>
              {multi ? (
                <textarea name={key} rows={3} className="input" defaultValue={value} />
              ) : (
                <input name={key} className="input" defaultValue={value} />
              )}
            </label>
          );
        })}
        <button className="btn btn-emerald">Save content</button>
      </form>
    </div>
  );
}
