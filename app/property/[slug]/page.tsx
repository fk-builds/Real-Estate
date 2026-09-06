import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/data/provider";
import { Listing, isPlotKind } from "@/lib/data/types";
import { Gallery } from "@/components/property/gallery";
import { PropertyMedia } from "@/components/property/property-media";
import { LeadForm } from "@/components/property/lead-form";
import { AgentCard, type AgentOtherListing } from "@/components/property/agent-card";
import { MapSection } from "@/components/property/detail/map-section";
import { ShareButton } from "@/components/share-button";
import { PropertyCard } from "@/components/property-card";
import { JsonLd } from "@/components/seo/json-ld";
import { propertyMetadata, propertyGraphLd } from "@/lib/seo/property";
import { kindLabels, purposeLabels, statusLabel } from "@/lib/site";
import { resolveFeatures, groupFeatures } from "@/lib/data/features";
import { photosOf } from "@/lib/data/media";
import { listingAgent, whatsappLink } from "@/lib/data/agents";
import {
  BedIcon, BathIcon, PinIcon, CheckIcon, WhatsAppIcon, PhoneIcon, StarIcon,
  EmailIcon, CarIcon, LayersIcon, RulerIcon, TagIcon, ShieldIcon,
} from "@/components/ui/icons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore();
  const listing = await store.getBySlug(slug);
  if (!listing) return { title: "Property not found" };
  return propertyMetadata(listing);
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStore();
  const listing = await store.getBySlug(slug);
  if (!listing) notFound();

  // Similar (ranked) + a couple of other listings in the same city for the agent.
  const [similar, cityItems] = await Promise.all([
    store.getRelated(listing, 3),
    store.search({ citySlug: listing.citySlug }, { pageSize: 3 }).then((r) => r.items),
  ]);
  const agent = listingAgent(listing);
  const others: AgentOtherListing[] = cityItems
    .filter((l) => l.id !== listing.id)
    .slice(0, 2)
    .map((l) => ({
      slug: l.slug, title: l.title, priceDisplay: l.priceDisplay,
      areaLabel: l.areaLabel, coverImage: l.coverImage,
    }));

  return <DetailView listing={listing} similar={similar} agentName={agent.name} agentOther={others} />;
}

async function DetailView({
  listing,
  similar,
  agentName,
  agentOther,
}: {
  listing: Listing;
  similar: Listing[];
  agentName: string;
  agentOther: AgentOtherListing[];
}) {
  const plotLike = isPlotKind(listing.kind);
  const agent = listingAgent(listing);
  const url = `http://localhost:3000/property/${listing.slug}`;
  const waText = `Hi, I'm interested in "${listing.title}" (${url}). Please share more details.`;
  const phone = agent.phoneHref;
  const waLink = whatsappLink(agent.whatsapp, waText);
  const purpose = purposeLabels[listing.purpose];
  const kindLabel = kindLabels[listing.kind] ?? listing.kind;
  const propertyId = /^\d+$/.test(listing.id)
    ? `MZ-${String(listing.id).padStart(5, "0")}`
    : listing.id;
  const isLive = listing.status === "available" || listing.status === "under_offer" || listing.status === "reserved";
  const parking = parkingValue(listing);
  const facts = [
    { icon: <RulerIcon className="h-6 w-6" />, v: listing.areaRaw || "—", l: plotLike ? "Plot size" : "Covered area" },
    { icon: <BedIcon className="h-6 w-6" />, v: listing.beds ? String(listing.beds) : "—", l: "Bedrooms" },
    { icon: <BathIcon className="h-6 w-6" />, v: listing.baths ? String(listing.baths) : "—", l: "Bathrooms" },
    { icon: <CarIcon className="h-6 w-6" />, v: parking, l: "Parking" },
    { icon: <LayersIcon className="h-6 w-6" />, v: listing.floors ? String(listing.floors) : "—", l: "Floors" },
    { icon: <TagIcon className="h-6 w-6" />, v: propertyId, l: "Property ID" },
  ];

  return (
    <>
      {/* breadcrumb band */}
      <div className="border-b border-line bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <nav className="flex flex-wrap items-center gap-2 text-[0.85rem] text-mut">
            <Link href="/" className="hover:text-emerald">Home</Link><span>/</span>
            <Link href={`/properties?purpose=${listing.purpose}`} className="hover:text-emerald">{purpose}</Link><span>/</span>
            <Link href={`/properties?kind=${listing.kind}`} className="capitalize hover:text-emerald">{kindLabel}</Link><span>/</span>
            <span className="max-w-[260px] truncate font-semibold text-ink sm:max-w-none">{listing.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ======= HERO: title + price ======= */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-sale">{purpose === "For Rent" ? "FOR RENT" : purpose === "For Lease" ? "FOR LEASE" : "FOR SALE"}</span>
              <span className="badge bg-cream2 text-emerald">{kindLabel.toUpperCase()}</span>
              {listing.featured && <span className="badge bg-gold-deep text-white">FEATURED</span>}
              {listing.isNew && <span className="badge badge-plain">NEW</span>}
              {!isLive && listing.status && (
                <span className="badge bg-amber-500 text-white">{statusLabel(listing.status)}</span>
              )}
            </div>
            <h1 className="mt-3 font-serif text-[clamp(1.7rem,3.4vw,2.7rem)] font-semibold leading-tight text-ink">
              {listing.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.95rem] text-mut">
              <PinIcon className="h-4 w-4 text-gold-deep" />
              <span>{listing.locationPath?.join(" › ")}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.8rem] font-semibold">
              <span className="inline-flex items-center gap-1.5 text-emerald">
                <ShieldIcon className="h-4 w-4" /> Title verified
              </span>
              <span className="inline-flex items-center gap-1 text-mut">
                <StarIcon className="h-3.5 w-3.5 text-star" />
                {listing.views.toLocaleString("en-PK")} views
              </span>
              <span className="text-mut">· {listing.postedLabel}</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-serif text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-none text-ink">{listing.priceDisplay}</p>
            <p className="mt-1 text-sm text-mut">for {listing.purpose}</p>
            <div className="mt-3 flex gap-2">
              <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-wa btn-sm"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>
              <a href={`tel:${phone}`} className="btn btn-emerald btn-sm"><PhoneIcon className="h-4 w-4" /> Call</a>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* ======= MAIN COLUMN ======= */}
          <div className="min-w-0">
            {/* photo gallery + lightbox */}
            <Gallery items={photosOf(listing)} title={listing.title} />

            {/* sticky-ish quick action on small hero is above; key facts */}
            <section className="mt-6 rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
              <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-6">
                {facts.map((f) => (
                  <div key={f.l} className="text-center">
                    <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-cream text-emerald">{f.icon}</div>
                    <div className="mt-2 truncate text-[0.95rem] font-extrabold text-ink" title={f.v}>{f.v}</div>
                    <div className="text-[0.66rem] font-semibold uppercase tracking-wide text-mut">{f.l}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* description */}
            <section className="mt-8" id="description">
              <h2 className="font-serif text-2xl font-semibold text-ink">About this {plotLike ? "plot" : "property"}</h2>
              <div className="mt-3 space-y-3 text-body leading-relaxed">
                <p>{listing.description}</p>
                <p>
                  This listing is <strong>title-verified by Manzil&rsquo;s legal desk</strong>. {agentName} verified it in
                  person and handles the full transfer. Current owner holds clear possession and all utility connections
                  are active.
                </p>
              </div>
            </section>

            {/* features & amenities */}
            <section className="mt-8" id="features">
              <h2 className="font-serif text-2xl font-semibold text-ink">Features &amp; amenities</h2>
              <FeatureTagCloud keys={listing.featureKeys ?? []} />
            </section>

            {/* floor plans, documents, video, virtual tour */}
            <div id="floorplan"><PropertyMedia listing={listing} /></div>

            {/* location + interactive map */}
            <MapSection
              latitude={listing.latitude}
              longitude={listing.longitude}
              query={`${listing.areaLabel}, ${listing.cityName}, Pakistan`}
              title={listing.title}
            />
          </div>

          {/* ======= SIDEBAR ======= */}
          <aside className="space-y-5">
            {/* price + CTAs (sticky) */}
            <div className="rounded-2xl border border-linesoft bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-end justify-between gap-2">
                <div className="font-serif text-[1.7rem] font-bold text-ink">{listing.priceDisplay}</div>
              </div>
              <div className="mt-1 text-xs font-semibold text-mut">
                {kindLabel} · {purpose} · {listing.areaLabel}, {listing.cityName}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[0.72rem] font-bold">
                <span className="rounded-full bg-cream px-2.5 py-1 text-emerald">{kindLabel.toUpperCase()}</span>
                {listing.constructionYear ? (
                  <span className="rounded-full bg-cream px-2.5 py-1 text-ink-soft">Built {listing.constructionYear}</span>
                ) : null}
                {listing.furnishingStatus && listing.furnishingStatus !== "unfurnished" ? (
                  <span className="rounded-full bg-cream px-2.5 py-1 capitalize text-emerald">{listing.furnishingStatus.replace("_", " ")}</span>
                ) : null}
                <span className="rounded-full bg-cream px-2.5 py-1 text-ink-soft">{propertyId}</span>
              </div>

              {/* CTA group */}
              <div className="mt-5 flex flex-col gap-2">
                <a href="#inquiry" className="btn btn-gold w-full">
                  <EmailIcon className="h-4 w-4" /> Contact agent
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-wa"><WhatsAppIcon className="h-5 w-5" /> WhatsApp now</a>
                  <a href={`tel:${phone}`} className="btn btn-emerald"><PhoneIcon className="h-4 w-4" /> Call now</a>
                </div>
              </div>

              <ul className="mt-5 space-y-1.5 border-t border-linesoft pt-4 text-[0.85rem] text-ink-soft">
                <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 flex-none text-emerald" /> Title verified by Manzil legal desk</li>
                <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 flex-none text-emerald" /> {agentName} available now to help</li>
                <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 flex-none text-emerald" /> Free viewing &amp; transfer guidance</li>
              </ul>
              <ShareButton title={listing.title} />
            </div>

            {/* inquiry form */}
            <div id="inquiry" className="scroll-mt-28 rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-emerald to-gold-deep font-serif text-sm font-bold text-white">{agent.initials}</div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-ink">Enquire about this property</h3>
                  <p className="text-xs text-mut">Reply from {agent.name} within ~15 minutes</p>
                </div>
              </div>
              <div className="mt-4">
                <LeadForm listingId={listing.id} listingTitle={listing.title} agentName={agent.name} />
              </div>
            </div>

            {/* agent */}
            <AgentCard agent={agent} listingTitle={listing.title} listingUrl={url} other={agentOther} />
          </aside>
        </div>

        {/* similar */}
        {similar.length > 0 && (
          <div className="mt-16" id="similar">
            <h2 className="mb-1 font-serif text-2xl font-semibold text-ink">Similar properties</h2>
            <p className="mb-6 text-sm text-mut">Matched by location, property type, price and size.</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((l) => (
                <PropertyCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[0.8rem] font-bold text-ink">{listing.title}</div>
            <div className="font-serif text-lg font-bold text-emerald">{listing.priceDisplay}</div>
          </div>
          <a href={`tel:${phone}`} className="btn btn-emerald btn-sm flex-none"><PhoneIcon className="h-4 w-4" /> Call</a>
          <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-wa btn-sm flex-none"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>
        </div>
      </div>

      <JsonLd data={propertyGraphLd(listing, {
        agent: { name: agent.name, role: agent.role, phone: agent.phoneHref, email: agent.email },
        trail: listingSeoTrail(listing),
      })} />
    </>
  );
}

/**
 * Deep location path for breadcrumb schema, e.g.
 *   Home → Lahore → DHA Lahore → Phase 6 → Block A → Plot 123
 * Built from the enriched listing display fields (city → project/area → block).
 */
function listingSeoTrail(l: Listing): Array<{ name: string; path?: string }> {
  const names = new Set<string>();
  const out: Array<{ name: string; path?: string }> = [];
  const push = (name?: string) => {
    if (name && !names.has(name)) {
      names.add(name);
      out.push({ name });
    }
  };
  push(l.cityName);
  if (l.project?.name) push(l.project.name);
  push(l.areaLabel);
  push(l.subArea);
  if (l.plotNumber && l.plotNumber.toLowerCase() !== "house") push(l.plotNumber);
  return out;
}

function parkingValue(l: Listing): string {
  const a = l.attributes ?? {};
  const keys = ["carPorch", "garage", "parkingBays", "parkingSpots", "carSpaces"] as const;
  const n = keys.reduce<number>((s, k) => s + (typeof a[k] === "number" ? (a[k] as number) : 0), 0);
  if (n > 0) return n === 1 ? "1 space" : `${n} spaces`;
  return (l.featureKeys ?? []).includes("parking") ? "Available" : "—";
}

/** Grouped, dictionary-driven feature tags — no features hardcoded in JSX. */
function FeatureTagCloud({ keys }: { keys: string[] }) {
  if (!keys.length) return <p className="mt-3 text-sm text-mut">No features listed — contact the advisor for details.</p>;
  const groups = groupFeatures(resolveFeatures(keys));
  return (
    <div className="mt-4 grid gap-6 sm:grid-cols-2">
      {groups.map((g) => (
        <div key={g.category}>
          <div className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-widest text-mut">{g.category}</div>
          <div className="flex flex-wrap gap-2">
            {g.items.map((f) => (
              <Link
                key={f.key}
                href={`/properties?feature=${f.key}`}
                title={`Browse ${f.label.toLowerCase()} properties`}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[0.85rem] font-semibold text-ink-soft transition hover:border-emerald hover:text-emerald"
              >
                <CheckIcon className="h-3.5 w-3.5 text-emerald" /> {f.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
