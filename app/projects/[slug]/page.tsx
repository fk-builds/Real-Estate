import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveSociety } from "@/lib/data/project-page";
import type { SocietyModel } from "@/lib/data/project-page";
import { PropertyCard } from "@/components/property-card";
import { SearchMap } from "@/components/map/search-map";
import { toMapListing } from "@/lib/data/map-geo";
import { whatsappLink } from "@/lib/data/agents";
import {
  PinIcon, PhoneIcon, EmailIcon, WhatsAppIcon, ShieldIcon, MapIcon, CheckIcon,
  BuildingIcon, LayersIcon, DownloadIcon,
} from "@/components/ui/icons";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await resolveSociety(slug);
  if (!s) return { title: "Project not found" };
  return {
    title: `${s.name} — ${s.place}`,
    description: s.description[0] ?? `${s.name} — ${s.kindLabel} in ${s.place}.`,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { title: s.name, description: s.tagline, images: [{ url: s.cover }] },
  };
}

export default async function SocietyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await resolveSociety(slug);
  if (!s) notFound();

  return (
    <>
      {/* hero with cover */}
      <div className="relative isolate overflow-hidden text-white">
        <Image src={s.cover} alt={s.name} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35" />
        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <nav className="mb-6 flex flex-wrap gap-2 text-sm text-white/80">
            <Link href="/" className="hover:text-white">Home</Link><span>/</span>
            <Link href="/projects" className="hover:text-white">Projects</Link>
            <span>/</span>
            <span className="font-semibold text-white">{s.name}</span>
          </nav>
          <div className="max-w-3xl">
            <span className="badge bg-white/15 text-white backdrop-blur">{s.kindLabel}</span>
            <h1 className="mt-4 font-serif text-[clamp(2rem,4.4vw,3.4rem)] font-bold leading-tight">{s.name}</h1>
            {s.tagline && <p className="mt-2 max-w-2xl text-lg text-white/90">{s.tagline}</p>}
            <p className="mt-3 flex items-center gap-1.5 text-white/85"><PinIcon className="h-4 w-4 text-gold" />{s.place}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {s.devStatus && <span className="badge bg-emerald text-white">{s.devStatus}</span>}
              {s.priceFrom && <span className="badge bg-gold-deep text-white">From {s.priceFrom}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* anchor nav */}
      <div className="sticky top-[57px] z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-6 py-2 text-sm font-bold text-ink-soft">
          {[["overview", "Overview"], ["properties", "Available"], ["phases", "Phases"], ["amenities", "Amenities"], ["gallery", "Gallery"], ["location", "Location"], ["faq", "FAQ"], ["contact", "Contact"]].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap hover:text-emerald">{label}</a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ===== main ===== */}
          <div className="min-w-0 space-y-14">
            {/* overview + meta */}
            <section id="overview" className="scroll-mt-24">
              <H2>Overview</H2>
              <div className="space-y-3 leading-relaxed text-body">{s.description.map((p, i) => <p key={i}>{p}</p>)}</div>
              {(s.statusMeta.length > 0) && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {s.statusMeta.map((m) => (
                    <div key={m.label} className="rounded-xl border border-linesoft bg-white p-4 text-center shadow-sm">
                      <div className="text-[0.7rem] font-extrabold uppercase tracking-wide text-mut">{m.label}</div>
                      <div className="mt-1 text-sm font-extrabold text-ink">{m.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* available properties */}
            {s.listings.length > 0 && (
              <section id="properties" className="scroll-mt-24">
                <div className="flex items-end justify-between gap-3">
                  <H2>Available in {s.name}</H2>
                  {s.citySlug && <Link href={`/properties?city=${s.citySlug}`} className="text-sm font-bold text-emerald hover:underline">All in {s.city} →</Link>}
                </div>
                <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {s.listings.map((l) => <PropertyCard key={l.id} listing={l} />)}
                </div>
                {s.listings.length > 0 && (
                  <div className="mt-6">
                    <SearchMap listings={s.listings.map(toMapListing)} />
                  </div>
                )}
              </section>
            )}

            {/* phases / sectors / blocks */}
            <section id="phases" className="scroll-mt-24">
              <H2>Phases, sectors &amp; blocks</H2>
              <p className="mt-2 text-sm text-mut">Live inventory across the society — each chip links to matching properties.</p>
              <Group label="Phases" icon={<LayersIcon className="h-4 w-4" />} items={s.phases} project={s.slug} />
              <Group label="Sectors" icon={<LayersIcon className="h-4 w-4" />} items={s.sectors} project={s.slug} />
              <Group label="Blocks" icon={<BuildingIcon className="h-4 w-4" />} items={s.blocks} project={s.slug} />
              {s.phases.length + s.sectors.length + s.blocks.length === 0 && (
                <p className="mt-3 rounded-xl bg-cream p-4 text-sm text-mut">
                  {s.unitsText ?? "New phases are being released — ask an advisor for the latest availability map."}
                </p>
              )}
            </section>

            {/* amenities */}
            {s.amenities.length > 0 && (
              <section id="amenities" className="scroll-mt-24">
                <H2>Amenities &amp; features</H2>
                <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {s.amenities.map((a) => (
                    <li key={a} className="flex items-start gap-2.5 rounded-xl border border-linesoft bg-white p-3 text-sm font-semibold text-ink-soft">
                      <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-emerald" /> {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* gallery */}
            {s.gallery.length > 0 && (
              <section id="gallery" className="scroll-mt-24">
                <H2>Gallery</H2>
                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {s.gallery.map((g, i) => (
                    <a key={g + i} href={g} target="_blank" rel="noreferrer" className={i === 0 ? "col-span-2 row-span-2" : ""}>
                      <div className="relative h-full min-h-[140px] w-full overflow-hidden rounded-2xl">
                        <Image src={g} alt={`${s.name} gallery ${i + 1}`} fill sizes="(max-width:640px)50vw,25vw" className="object-cover transition duration-300 hover:scale-105" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* map */}
            {s.coords && (
              <section id="location" className="scroll-mt-24">
                <H2>Location</H2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-linesoft shadow-sm">
                  <iframe
                    title={`${s.name} location map`} loading="lazy"
                    src={`https://www.google.com/maps?q=${s.coords.lat},${s.coords.lng}&z=13&output=embed`}
                    className="h-[380px] w-full border-0"
                  />
                </div>
              </section>
            )}

            {/* FAQ */}
            {s.faqs.length > 0 && (
              <section id="faq" className="scroll-mt-24">
                <H2>Frequently asked questions</H2>
                <div className="mt-5 space-y-3">
                  {s.faqs.map((f, i) => (
                    <details key={i} className="group rounded-2xl border border-linesoft bg-white px-5 py-4 shadow-sm">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-ink">
                        {f.q}
                        <span className="text-emerald transition group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-3 text-body leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ===== sidebar ===== */}
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-ink">
                <ShieldIcon className="h-5 w-5 text-emerald" /> Talk to an advisor
              </h3>
              <p className="mt-1 text-sm text-mut">Free consultation · price lists · payment plans &amp; due diligence for {s.name}.</p>
              <div className="mt-4 flex flex-col gap-2">
                <a href={`tel:${s.contact.phone.replace(/[^\d+]/g, "")}`} className="btn btn-emerald w-full"><PhoneIcon className="h-4 w-4" /> Call now</a>
                <a href={whatsappLink(s.contact.whatsapp, `Hi, I'm interested in ${s.name}. Please share prices & availability.`)} target="_blank" rel="noreferrer" className="btn btn-wa w-full"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>
                <a href={`mailto:${s.contact.email}?subject=${encodeURIComponent(`${s.name} enquiry`)}`} className="btn btn-ghost w-full"><EmailIcon className="h-4 w-4" /> Email us</a>
              </div>
              <a href="/sell" className="mt-3 block text-center text-xs font-bold text-emerald hover:underline">List property inside {s.name} →</a>
            </div>

            <div className="rounded-2xl bg-emerald p-6 text-white">
              <div className="font-serif text-lg font-semibold">Why invest in {s.name}?</div>
              <ul className="mt-3 space-y-2 text-sm text-white/90">
                <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 flex-none" /> NOC & title verified by Manzil</li>
                <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 flex-none" /> Senior local advisor for the society</li>
                <li className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 flex-none" /> Transparent price benchmarking</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
              <h4 className="text-[0.7rem] font-extrabold uppercase tracking-widest text-mut">Contact</h4>
              <div className="mt-3 space-y-2 text-sm">
                <a className="flex items-center gap-2 text-ink-soft hover:text-emerald" href={`tel:${s.contact.phone}`}><PhoneIcon className="h-4 w-4 text-emerald" /> {s.contact.phone}</a>
                <a className="flex items-center gap-2 text-ink-soft hover:text-emerald" href={`mailto:${s.contact.email}`}><EmailIcon className="h-4 w-4 text-emerald" /> {s.contact.email}</a>
                <p className="flex items-center gap-2 text-ink-soft"><MapIcon className="h-4 w-4 text-emerald" /> {s.place}</p>
              </div>
            </div>
          </aside>
        </div>

        {/* related */}
        {s.related.length > 0 && (
          <div className="mt-16 border-t border-line pt-12">
            <H2>Related projects</H2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {s.related.map((r) => (
                <Link key={r.slug} href={`/projects/${r.slug}`} className="group overflow-hidden rounded-2xl border border-linesoft bg-white shadow-sm">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={r.cover} alt={r.name} fill className="object-cover transition duration-300 group-hover:scale-105" sizes="33vw" />
                  </div>
                  <div className="p-4">
                    <div className="font-extrabold text-ink group-hover:text-emerald">{r.name}</div>
                    <div className="mt-0.5 text-sm text-mut">{r.place}</div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald"><DownloadIcon className="h-3.5 w-3.5" /> View project</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Group({ label, icon, items, project }: { label: string; icon: React.ReactNode; items: { name: string; slug: string; count: number }[]; project?: string }) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-2 text-[0.72rem] font-extrabold uppercase tracking-widest text-emerald">{icon}{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((c) => (
          <Link key={c.slug} href={project ? `/projects/${project}/${c.slug}` : `/properties?q=${encodeURIComponent(c.name)}`}
            className="rounded-xl border border-line bg-white px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:border-emerald hover:text-emerald">
            {c.name}
            {c.count > 0 && <span className="ml-1.5 rounded-full bg-cream px-1.5 text-xs text-emerald">{c.count}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-2xl font-semibold text-ink sm:text-[1.7rem]">{children}</h2>;
}
