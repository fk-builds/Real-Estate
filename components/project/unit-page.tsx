import Image from "next/image";
import Link from "next/link";
import type { PhaseModel } from "@/lib/data/phase-page";
import { PropertyCard } from "@/components/property-card";
import { MapSection } from "@/components/property/detail/map-section";
import { whatsappLink } from "@/lib/data/agents";
import {
  PinIcon, PhoneIcon, EmailIcon, WhatsAppIcon, ShieldIcon, CheckIcon,
  BuildingIcon, LayersIcon, GridIcon, AreaIcon,
} from "@/components/ui/icons";

const DRILL = ["project", "phase", "sector", "block"];

/**
 * Shared renderer for a society unit page at any depth (phase / sector / block).
 * Sections adapt to what exists in the data: phases show sector cards with
 * nested blocks; sectors show their blocks; blocks show only available
 * properties. Empty sections are omitted.
 */
export function UnitPage({ unit }: { unit: PhaseModel }) {
  const anc = unit.ancestors.filter((a) => DRILL.includes(a.level)); // [project, phase, …]
  const deeper = anc.slice(1); // ancestors strictly below the society (parent last)
  const deeperSlugs = deeper.map((a) => a.slug);
  const base = `/projects/${unit.societySlug}`;
  const deeperPath = deeperSlugs.map((s) => "/" + s).join("");
  const parentName = deeper.length ? deeper[deeper.length - 1].name : unit.societyName;
  const parentPrefix = deeper.length ? `${base}${deeperPath}` : base;
  // breadcrumb links: society → … → parent (each cumulative)
  const crumbs = [{ label: unit.societyName, url: base }];
  let u = base;
  for (const a of deeper) { u = `${u}/${a.slug}`; crumbs.push({ label: a.name, url: u }); }

  const anchors = [
    ["overview", "Overview"],
    ...(unit.listings.length ? [["available", "Available"]] : []),
    ...(unit.sectors.length ? [["sectors", "Sectors"]] : []),
    ...(unit.level !== "block" && unit.blocks.length ? [["blocks", "Blocks"]] : []),
    ...(unit.amenities.length ? [["amenities", "Amenities"]] : []),
    ["location", "Location"], ["faq", "FAQ"], ["contact", "Contact"],
  ] as const;

  return (
    <>
      {/* hero */}
      <div className="relative isolate overflow-hidden text-white">
        <Image src={unit.cover} alt={`${unit.societyName} — ${unit.name}`} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35" />
        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <Breadcrumb anc={anc} unitName={unit.name} unitSlug={unit.slug} base={base} />
          <div className="max-w-3xl">
            <span className="badge bg-white/15 text-white backdrop-blur">{unit.societyName}</span>
            <h1 className="mt-4 font-serif text-[clamp(2rem,4.4vw,3.3rem)] font-bold leading-tight">
              {unit.name} <span className="font-semibold text-white/80">· {unit.societyName}</span>
            </h1>
            {unit.tagline && <p className="mt-2 max-w-2xl text-lg text-white/90">{unit.tagline}</p>}
            <p className="mt-3 flex items-center gap-1.5 text-white/85"><PinIcon className="h-4 w-4 text-gold" />{unit.place}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {unit.devStatus && <span className="badge bg-emerald text-white">{unit.devStatus}</span>}
              <span className="badge bg-white/15 text-white backdrop-blur">{unit.listingCount} available</span>
            </div>
          </div>
        </div>
      </div>

      {/* anchor nav */}
      <div className="sticky top-[57px] z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-6 py-2 text-sm font-bold text-ink-soft">
          {anchors.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap hover:text-emerald">{label}</a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* main */}
          <div className="min-w-0 space-y-14">
            <section id="overview" className="scroll-mt-24">
              <H2>Overview</H2>
              <div className="mt-3 space-y-3 leading-relaxed text-body">{unit.overview.map((p, i) => <p key={i}>{p}</p>)}</div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold text-emerald">
                {anc.length > 1 && <Link href={parentPrefix} className="hover:underline">← Back to {parentName}</Link>}
                <Link href={base} className="hover:underline">View {unit.societyName} project page →</Link>
              </div>
            </section>

            {/* available properties */}
            {unit.listings.length > 0 && (
              <section id="available" className="scroll-mt-24">
                <div className="flex items-end justify-between gap-3">
                  <H2>Available in {unit.name}</H2>
                  {unit.citySlug && <Link href={`/properties?city=${unit.citySlug}`} className="text-sm font-bold text-emerald hover:underline">All in {unit.city} →</Link>}
                </div>
                <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
                  {unit.listings.map((l) => <PropertyCard key={l.id} listing={l} />)}
                </div>
              </section>
            )}

            {/* sectors (only meaningful at phase level) */}
            {unit.level === "phase" && unit.sectors.length > 0 && (
              <section id="sectors" className="scroll-mt-24">
                <H2>Sectors in {unit.name}</H2>
                <p className="mt-2 text-sm text-mut">Each sector is a gated sub-area with its own blocks.</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {unit.sectors.map((s) => (
                    <div key={s.slug} className="rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
                      <Link href={pathLink(base, s.path)} className="flex items-center gap-2 font-extrabold text-ink hover:text-emerald">
                        <LayersIcon className="h-4 w-4 text-emerald" />{s.name}
                        {s.count > 0 && <span className="ml-1 rounded-full bg-cream px-2 py-0.5 text-xs text-emerald">{s.count}</span>}
                      </Link>
                      {s.blocks.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {s.blocks.map((b) => (
                            <Link key={b.slug} href={pathLink(base, b.path)}
                              className="rounded-lg border border-line bg-cream/60 px-2.5 py-1 text-xs font-bold text-ink-soft hover:border-emerald hover:text-emerald">
                              {b.name}{b.count > 0 && ` · ${b.count}`}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* blocks */}
            {unit.level !== "block" && unit.blocks.length > 0 && (
              <section id="blocks" className="scroll-mt-24">
                <H2>Blocks in {unit.name}</H2>
                <p className="mt-2 text-sm text-mut">Each chip links to its live inventory.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {unit.blocks.map((b) => (
                    <Link key={b.slug} href={pathLink(base, b.path)}
                      className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:border-emerald hover:text-emerald">
                      <BuildingIcon className="h-4 w-4 text-gold-deep" />{b.name}
                      {b.count > 0 && <span className="rounded-full bg-cream px-1.5 text-xs text-emerald">{b.count}</span>}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* property listings (compact) */}
            {unit.listings.length > 0 && (
              <section id="listings" className="scroll-mt-24">
                <H2>Property listings</H2>
                <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-linesoft bg-white shadow-sm">
                  {unit.listings.map((l) => (
                    <Link key={l.id} href={`/property/${l.slug}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-cream/50">
                      <div className="min-w-0">
                        <div className="truncate font-bold text-ink">{l.title}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mut">
                          <span className="capitalize">{l.kind} · {l.areaLabel}</span>
                          {l.beds > 0 && <span>{l.beds} bed</span>}
                          {l.areaRaw && <span><AreaIcon className="mr-1 inline h-3 w-3" />{l.areaRaw}</span>}
                          {l.plotNumber && <span>📍 {l.plotNumber}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="whitespace-nowrap font-serif text-lg font-bold text-ink">{l.priceDisplay}</div>
                        <div className="text-xs font-bold text-emerald">View →</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* amenities */}
            {unit.amenities.length > 0 && (
              <section id="amenities" className="scroll-mt-24">
                <H2>Amenities &amp; features</H2>
                <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {unit.amenities.map((a) => (
                    <li key={a} className="flex items-start gap-2.5 rounded-xl border border-linesoft bg-white p-3 text-sm font-semibold text-ink-soft">
                      <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-emerald" />{a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* map */}
            {unit.coords && (
              <section id="location" className="scroll-mt-24">
                <MapSection latitude={unit.coords.lat} longitude={unit.coords.lng} query={`${unit.name}, ${unit.societyName}, ${unit.city}`} title={`${unit.name} — ${unit.societyName}`} />
              </section>
            )}

            {/* FAQ */}
            {unit.faqs.length > 0 && (
              <section id="faq" className="scroll-mt-24">
                <H2>Frequently asked questions</H2>
                <div className="mt-5 space-y-3">
                  {unit.faqs.map((f, i) => (
                    <details key={i} className="group rounded-2xl border border-linesoft bg-white px-5 py-4 shadow-sm">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-ink">
                        {f.q}<span className="text-emerald transition group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-3 text-body leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start" id="contact">
            <div className="rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-ink">
                <ShieldIcon className="h-5 w-5 text-emerald" /> Talk to an advisor
              </h3>
              <p className="mt-1 text-sm text-mut">Free consultation · files, price lists &amp; due diligence for {unit.name}, {unit.societyName}.</p>
              <div className="mt-4 flex flex-col gap-2">
                <a href={`tel:${unit.contact.phone.replace(/[^\d+]/g, "")}`} className="btn btn-emerald w-full"><PhoneIcon className="h-4 w-4" /> Call now</a>
                <a href={whatsappLink(unit.contact.whatsapp, `Hi, I'm interested in ${unit.name}, ${unit.societyName}. Please share prices & availability.`)} target="_blank" rel="noreferrer" className="btn btn-wa w-full"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>
                <a href={`mailto:${unit.contact.email}?subject=${encodeURIComponent(`${unit.name}, ${unit.societyName} enquiry`)}`} className="btn btn-ghost w-full"><EmailIcon className="h-4 w-4" /> Email us</a>
              </div>
              <Link href={base} className="mt-3 block text-center text-xs font-bold text-emerald hover:underline">Back to {unit.societyName} →</Link>
            </div>

            <div className="rounded-2xl bg-emerald p-6 text-white">
              <div className="font-serif text-lg font-semibold">Why {unit.societyName}?</div>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 flex-none" /> NOC &amp; title verified by Manzil</li>
                <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 flex-none" /> Senior local advisor for the society</li>
                <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 flex-none" /> Transparent price benchmarking</li>
              </ul>
            </div>
          </aside>
        </div>

        {/* sibling units (related phases/sectors/blocks) */}
        {unit.siblings.length > 0 && (
          <div className="mt-16 border-t border-line pt-12">
            <H2>Other {unit.level}s in {parentName}</H2>
            <div className="mt-5 flex flex-wrap gap-2">
              {unit.siblings.map((sib) => (
                <Link key={sib.slug} href={`${parentPrefix}/${sib.slug}`}
                  className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-bold text-ink-soft transition hover:border-emerald hover:text-emerald">
                  <GridIcon className="h-4 w-4 text-emerald" />{sib.name}
                  {sib.count > 0 && <span className="rounded-full bg-cream px-1.5 text-xs text-emerald">{sib.count}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Breadcrumb({ anc, unitName, unitSlug, base }: { anc: PhaseModel["ancestors"]; unitName: string; unitSlug: string; base: string }) {
  const acc = [base];
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/80">
      <Link href="/" className="hover:text-white">Home</Link><span>/</span>
      <Link href="/projects" className="hover:text-white">Projects</Link><span>/</span>
      {anc.map((a) => {
        acc.push(`${acc[acc.length - 1]}/${a.slug}`);
        return (
          <span key={a.slug} className="contents">
            <Link href={acc[acc.length - 1]} className="hover:text-white">{a.name}</Link><span>/</span>
          </span>
        );
      })}
      <Link href={`${base}/${unitSlug}`} className="font-semibold text-white">◂ {unitName}</Link>
    </nav>
  );
}

function pathLink(base: string, path: string[]) {
  return path.length ? `${base}/${path.join("/")}` : base;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-2xl font-semibold text-ink sm:text-[1.7rem]">{children}</h2>;
}
