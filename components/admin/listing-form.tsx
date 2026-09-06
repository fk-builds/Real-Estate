import type { Listing } from "@/lib/data/types";
import { STATUS_LABELS } from "@/lib/data/types";
import type { PropertyFeature } from "@/lib/data/features";
import { kindLabels } from "@/lib/site";
import { saveListingAction } from "@/app/admin/actions";

const kinds = Object.entries(kindLabels);

/** Server-rendered listing create/edit form. Submits to a server action. */
export function ListingForm({ listing, catalogue }: { listing?: Listing | null; catalogue: PropertyFeature[] }) {
  const v = listing;
  const selected = new Set(v?.featureKeys ?? []);
  // group catalogue by category for the checkbox grid
  const groups = catalogue.reduce<Record<string, PropertyFeature[]>>((acc, f) => {
    (acc[f.category] ||= []).push(f);
    return acc;
  }, {});
  // media scalar defaults resolved from the ordered MediaItem[] catalogue
  const med = v?.media ?? [];
  const fpDefault = v?.floorplanUrl ?? med.find((m) => m.kind === "floorplan")?.url ?? "";
  const docsDefault = med
    .filter((m) => m.kind === "document")
    .map((d) => (d.name ? `${d.url} | ${d.name}` : d.url))
    .join("\n");
  const videoDefault = v?.videoUrl ?? med.find((m) => m.kind === "video")?.url ?? "";
  const tourDefault = v?.virtualTourUrl ?? med.find((m) => m.kind === "virtual_tour")?.url ?? "";
  return (
    <form action={saveListingAction} className="space-y-6">
      {v && <input type="hidden" name="id" value={v.id} />}

      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title (required)">
            <input required name="title" defaultValue={v?.title} className="input" placeholder="e.g. 10 Marla House, Bahria Town" />
          </Field>
          <Field label="Price (PKR)">
            <input name="price" type="number" defaultValue={v?.price ?? ""} className="input" placeholder="145000000" />
          </Field>
          <Field label="Listing type (purpose)">
            <select name="purpose" defaultValue={v?.purpose ?? "sale"} className="input">
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="lease">For Lease</option>
            </select>
          </Field>
          <Field label="Property type">
            <select name="kind" defaultValue={v?.kind ?? "house"} className="input">
              {kinds.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={v?.status ?? "available"} className="input">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Price period">
            <select name="pricePeriod" defaultValue={v?.pricePeriod ?? "one_time"} className="input">
              <option value="one_time">One time</option>
              <option value="monthly">Per month</option>
            </select>
          </Field>
          <Field label="Area (display)">
            <input name="areaRaw" defaultValue={v?.areaRaw} className="input" placeholder="8,600 sqft / 1 Kanal / 10 Marla" />
          </Field>
        </div>
      </Section>

      <Section title="Location & taxonomy">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="City"><input name="cityName" defaultValue={v?.cityName ?? "Lahore"} className="input" /></Field>
          <Field label="Area / project"><input name="areaLabel" defaultValue={v?.areaLabel} className="input" placeholder="DHA Phase 6" /></Field>
          <Field label="Phase"><input name="phase" defaultValue={v?.phase} className="input" placeholder="Phase 6" /></Field>
          <Field label="Sector"><input name="sector" defaultValue={v?.sector} className="input" placeholder="Sector Z" /></Field>
          <Field label="Block / sub-area"><input name="block" defaultValue={v?.block} className="input" placeholder="Block J" /></Field>
          <Field label="Plot / unit number"><input name="plotNumber" defaultValue={v?.plotNumber} className="input" placeholder="Plot 12-C" /></Field>
        </div>
      </Section>

      <Section title="Size & specs">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Area (number)"><input name="areaNumber" type="number" step="any" defaultValue={v?.areaNumber ?? ""} className="input" placeholder="500 / 5445 / 10" /></Field>
          <Field label="Area unit"><select name="areaUnit" defaultValue={v?.areaUnit ?? "sqft"} className="input"><option>sqft</option><option>sqm</option><option>kanal</option><option>marla</option><option>sqyd</option><option>acre</option></select></Field>
          <Field label="Beds"><input name="beds" type="number" defaultValue={v?.beds ?? ""} className="input" /></Field>
          <Field label="Baths"><input name="baths" type="number" defaultValue={v?.baths ?? ""} className="input" /></Field>
          <Field label="Floors"><input name="floors" type="number" defaultValue={v?.floors ?? ""} className="input" placeholder="blank for land" /></Field>
          <Field label="Construction year"><input name="constructionYear" type="number" defaultValue={v?.constructionYear ?? ""} className="input" placeholder="2024" /></Field>
          <Field label="Furnishing"><select name="furnishingStatus" defaultValue={v?.furnishingStatus ?? ""} className="input"><option value="">—</option><option value="unfurnished">Unfurnished</option><option value="partially_furnished">Partially furnished</option><option value="furnished">Furnished</option></select></Field>
          <Field label="Possession"><input name="possessionStatus" defaultValue={v?.possessionStatus ?? ""} className="input" placeholder="ready / balloting_done" /></Field>
        </div>
      </Section>

      <Section title="Addressing & geo">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Street"><input name="street" defaultValue={v?.street ?? ""} className="input" placeholder="Street 25, Main Blvd" /></Field>
          <Field label="Latitude"><input name="latitude" type="number" step="any" defaultValue={v?.latitude ?? ""} className="input" placeholder="31.42" /></Field>
          <Field label="Longitude"><input name="longitude" type="number" step="any" defaultValue={v?.longitude ?? ""} className="input" placeholder="74.35" /></Field>
          <Field label="Currency"><input name="currency" defaultValue={v?.currency ?? "PKR"} className="input" /></Field>
        </div>
        <Field label="Property-specific attributes (JSON)">
          <textarea name="attributes" rows={3} className="input font-mono text-xs" defaultValue={v?.attributes ? JSON.stringify(v.attributes, null, 2) : ""} placeholder='{"carPorch":2,"solarReady":true}' />
        </Field>
      </Section>

      <Section title="Media">
        <p className="mb-3 -mt-1 text-xs text-mut">
          Photos, floor plans, documents, video and virtual tours are stored as an ordered media catalogue
          (<code className="rounded bg-cream px-1">property_media</code>). First photo line = cover. Photos render
          optimized (WebP/AVIF, responsive, lazy) via Next&nbsp;Image.
        </p>
        <Field label="Photos — one URL per line, first is the cover, top-to-bottom = order">
          <textarea name="gallery" rows={4} className="input font-mono text-xs"
            defaultValue={(v?.gallery ?? []).join("\n")} placeholder={"/images/hero.jpg\n/images/interior-living.jpg\n/images/bedroom-suite.jpg"} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Floor plan image URL">
            <input name="floorplanUrl" defaultValue={fpDefault} className="input font-mono text-xs" placeholder="/media/floorplan-ground.png" />
          </Field>
          <Field label="Video URL (YouTube / Vimeo / MP4 link)">
            <input name="videoUrl" defaultValue={videoDefault} className="input font-mono text-xs" placeholder="https://www.youtube.com/watch?v=…" />
          </Field>
          <Field label="Virtual tour URL (Matterport etc.)">
            <input name="virtualTourUrl" defaultValue={tourDefault} className="input font-mono text-xs" placeholder="https://my.matterport.com/show/?m=…" />
          </Field>
          <Field label="Documents — one per line:  URL | Display name">
            <textarea name="mediaDocuments" rows={2} className="input font-mono text-xs" defaultValue={docsDefault}
              placeholder={"/media/property-dossier.pdf | Title-verified dossier"} />
          </Field>
        </div>
      </Section>

      <Section title="Description">
        <textarea name="description" rows={5} className="input" defaultValue={v?.description} placeholder="Describe the property…" />
      </Section>

      <Section title="Features & amenities (tags)">
        <p className="mb-3 -mt-1 text-xs text-mut">
          Select from the shared feature dictionary. Add more tags under Admin → Features.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {Object.entries(groups).map(([cat, feats]) => (
            <div key={cat}>
              <div className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-widest text-mut">{cat}</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {feats.map((f) => (
                  <label key={f.key} className="flex items-center gap-1.5 text-sm font-medium text-ink-soft">
                    <input type="checkbox" name="featureKey" value={f.key} defaultChecked={selected.has(f.key)} className="h-4 w-4 accent-emerald" />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        {!catalogue.length && (
          <p className="mt-3 text-sm text-mut">No features in the dictionary yet.</p>
        )}
      </Section>

      <Section title="Status & flags">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
            <input type="checkbox" name="published" defaultChecked={v ? v.published !== false : true} className="h-4 w-4 accent-emerald" />
            Published (visible on site)
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
            <input type="checkbox" name="featured" defaultChecked={v?.featured ?? false} className="h-4 w-4 accent-gold-deep" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
            <input type="checkbox" name="verified" defaultChecked={v ? v.verified !== false : true} className="h-4 w-4 accent-emerald" />
            Title-verified
          </label>
        </div>
      </Section>

      <div className="flex gap-3 border-t border-line pt-5">
        <button className="btn btn-emerald">{v ? "Save changes" : "Create listing"}</button>
        <a href="/admin/listings" className="btn btn-ghost">Cancel</a>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-mut">{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
      <legend className="px-2 font-serif text-lg font-semibold text-emerald">{title}</legend>
      <div className="mt-2">{children}</div>
    </fieldset>
  );
}
