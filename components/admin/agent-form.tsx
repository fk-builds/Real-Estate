import type { Agent } from "@/lib/data/agents";
import type { Listing } from "@/lib/data/types";
import { saveAgentAction } from "@/app/admin/actions";

const CITY_OPTIONS = [
  { slug: "islamabad", label: "Islamabad" },
  { slug: "lahore", label: "Lahore" },
  { slug: "karachi", label: "Karachi" },
  { slug: "rawalpindi", label: "Rawalpindi" },
  { slug: "peshawar", label: "Peshawar" },
  { slug: "faisalabad", label: "Faisalabad" },
];

/** Agent create/edit form (server component — posts to saveAgentAction). */
export function AgentForm({ agent, listings }: { agent?: Agent; listings: Listing[] }) {
  const cities = agent?.cities ?? [];
  const assigned = agent?.assignedListingIds ?? [];
  return (
    <form action={saveAgentAction} className="grid gap-5 lg:grid-cols-2">
      {agent && <input type="hidden" name="id" value={agent.id} />}

      <section className="space-y-3 rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-ink">Profile & contact</h2>
        <Field label="Full name *">
          <input name="name" defaultValue={agent?.name} required className="input" placeholder="e.g. Ayesha Raza" />
        </Field>
        <Field label="Role / title">
          <input name="role" defaultValue={agent?.role} className="input" placeholder="e.g. Senior Advisor · Lahore" />
        </Field>
        <Field label="Profile photo (URL)">
          <input name="photo" defaultValue={agent?.photo ?? ""} className="input" placeholder="/images/agents/ayesha.jpg" />
        </Field>
        <Field label="Bio">
          <textarea name="bio" defaultValue={agent?.bio ?? ""} rows={3} className="input" placeholder="Short bio shown on the profile…" />
        </Field>
        <Field label="Specialization">
          <input name="specialization" defaultValue={agent?.specialization ?? ""} className="input" placeholder="e.g. DHA Lahore plots & homes" />
        </Field>
        <Field label="Phone (display)">
          <input name="phone" defaultValue={agent?.phone} className="input" placeholder="+92 300 000 0000" />
        </Field>
        <Field label="WhatsApp (country code, no +)">
          <input name="whatsapp" defaultValue={agent?.whatsapp} className="input" placeholder="923000000000" />
        </Field>
        <Field label="Email">
          <input name="email" type="email" defaultValue={agent?.email} className="input" placeholder="name@manzil.pk" />
        </Field>
        <Field label="Languages">
          <input name="languages" defaultValue={agent?.languages} className="input" placeholder="English · Urdu" />
        </Field>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <input type="checkbox" name="active" defaultChecked={agent?.active ?? true} className="h-4 w-4 accent-emerald" />
          Active on the site
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-ink">Cities served</h2>
        <div className="grid grid-cols-2 gap-2">
          {CITY_OPTIONS.map((c) => (
            <label key={c.slug} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-ink-soft">
              <input type="checkbox" name="city" value={c.slug} defaultChecked={cities.includes(c.slug)} className="h-4 w-4 accent-emerald" />
              {c.label}
            </label>
          ))}
        </div>

        <h2 className="pt-2 font-serif text-lg font-semibold text-ink">Assigned properties</h2>
        <p className="text-xs text-mut">Pick which listings this agent owns — they will appear as the listing&rsquo;s advisor.</p>
        <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-xl border border-line p-2">
          {listings.length === 0 && <p className="p-2 text-sm text-mut">No properties yet.</p>}
          {listings.map((l) => (
            <label key={l.id} className="flex items-start gap-2 rounded-lg px-2 py-1 text-sm hover:bg-cream">
              <input type="checkbox" name="agentListing" value={l.id} defaultChecked={assigned.includes(l.id)} className="mt-0.5 h-4 w-4 accent-emerald" />
              <span className="text-ink-soft">
                <span className="font-semibold text-ink">{l.title}</span>{" "}
                <span className="text-mut">· {l.cityName} · {l.priceDisplay}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <div className="lg:col-span-2">
        <button className="btn btn-emerald">Save agent</button>
        <a href="/admin/agents" className="btn btn-ghost ml-2">Cancel</a>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wide text-mut">{label}</span>
      {children}
    </label>
  );
}
