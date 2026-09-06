"use client";

import Image from "next/image";
import Link from "next/link";
import type { Listing, Project } from "@/lib/data/types";
import { PropertyCard } from "@/components/property-card";
import { AREA_TILES } from "@/lib/data/sample";
import { cx } from "@/lib/utils";
import { Reveal, Stagger } from "@/lib/client/reveal";
import { Kicker, SectionHead } from "@/components/home/primitives";
import {
  ArrowRightIcon, ShieldIcon, CheckIcon, PhoneIcon, StarIcon,
} from "@/components/ui/icons";

const TS = [
  "Verified Listings", "Title & NOC Checked", "Senior Advisors", "Legal Desk",
  "Smooth Closing", "Client Rated 4.9", "Free Valuations", "Pakistan-wide",
];

/* ------------------------------------------------------------------ */
/*  Gold trust ticker just below the hero                              */
/* ------------------------------------------------------------------ */
export function TrustMarquee() {
  const row = [...TS, ...TS];
  return (
    <div className="border-y border-line bg-paper2 py-3.5">
      <div className="overflow-hidden">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap [animation-duration:32s]">
          {row.map((t, i) => (
            <span key={i} className="flex items-center gap-3 text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-brand-2/70">
              {t} <StarIcon className="h-3 w-3 text-gold" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Curated collection (featured residences)                           */
/* ------------------------------------------------------------------ */
export function FeaturedListings({ listings }: { listings: Listing[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <SectionHead
          eyebrow="Curated Collection"
          title={<>Signature <em className="text-champagne italic">residences</em></>}
          desc="A hand-picked edit of Pakistan’s most covetable addresses, refreshed the moment new homes come to market."
        />
        <Reveal variant="up">
          <Link href="/properties" className="btn btn-ghost btn-sm">
            View all <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
      <Stagger as="div" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <PropertyCard key={l.id} listing={l} />
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  New developments                                                   */
/* ------------------------------------------------------------------ */
export function Developments({ projects }: { projects: Project[] }) {
  const [a, b, c] = projects;
  const tiles = [a, b, c].filter(Boolean) as Project[];
  return (
    <section className="bg-paper2 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            eyebrow="New Developments"
            light
            title={<>Projects setting the <em className="text-champagne italic">standard</em></>}
            desc="Buy directly from reputable developers — pre-launch pricing, milestone payments, and full title verification."
          />
          <Reveal variant="up">
            <Link href="/projects" className="btn btn-ghost btn-sm">
              All projects <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 lg:[grid-auto-rows:1fr]">
          {tiles.map((p, i) => (
            <Reveal key={p.slug} variant="up" delay={`${i * 0.1}s`} className="h-full">
              <ShowcaseTile p={p} featured={i === 0} />
            </Reveal>
          ))}
          {/* editorial card to balance the grid on the right */}
          <Reveal variant="up" delay="0.25s" className="hidden lg:flex h-full">
            <div className="group flex flex-col justify-center rounded-2xl border border-gold/40 bg-brand-2 p-8 text-white transition hover:bg-brand-3">
              <Kicker light>Talk to a senior advisor</Kicker>
              <p className="mt-4 font-display text-2xl font-medium leading-snug text-balance">
                Not sure which project suits your goals?
              </p>
              <p className="mt-3 text-sm text-white/70">Get a shortlist curated around your budget and timeline — free, no obligations.</p>
              <Link href="/contact" className="mt-6 inline-flex w-fit items-center gap-2 font-semibold text-gold-2">
                Book a consultation <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function statusTxt(s?: string) {
  const m: Record<string, string> = { pre_launch: "Pre-Launch", booking: "Booking Open", possession: "Ready Possession", sold_out: "Sold Out" };
  return m[s ?? ""] ?? "New Launch";
}

function ShowcaseTile({ p, featured }: { p: Project; featured?: boolean }) {
  return (
    <Link
      href={`/projects/${p.slug}`}
      className={cx(
        "group relative block h-full min-h-[340px] overflow-hidden rounded-2xl text-white",
        featured && "sm:min-h-[420px]",
      )}
    >
      <Image
        src={p.image}
        alt={p.name}
        fill
        sizes="(max-width:1024px)100vw,33vw"
        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f1a]/95 via-[#0d1f1a]/15 to-transparent" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/15" />
      <div className="relative flex h-full flex-col justify-end p-6">
        <span className="mb-3 inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-widest text-white/90 backdrop-blur">
          {statusTxt(p.status)}
        </span>
        <h3 className="font-display text-[1.55rem] font-medium leading-tight">{p.name}</h3>
        <p className="mt-1.5 line-clamp-2 max-w-md text-sm text-white/75">{p.description}</p>
        <div className="mt-3 flex items-center gap-2 text-[0.85rem]">
          {p.priceFrom && <span className="font-semibold text-gold-2">{p.priceFrom}</span>}
          <span className="text-white/50">·</span>
          <span className="text-white/70">{p.location}</span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Achievement / stats band                                           */
/* ------------------------------------------------------------------ */
export function ManzilStats() {
  const stats = [
    { n: "9.2", u: "B", pre: "PKR", t: "Closed in 2025", d: "Across homes, plots & projects." },
    { n: "2,400", u: "+", pre: "", t: "Active listings", d: "Every one reviewed & verified." },
    { n: "8", u: "", pre: "", t: "Major cities", d: "On-ground teams nationwide." },
    { n: "98", u: "%", pre: "", t: "Client retention", d: "From first viewing to referral." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
        <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {stats.map((s, i) => (
            <Reveal key={s.t} variant="up" delay={`${i * 0.08}s`} className="px-7 py-9 text-center md:py-11">
              <div className="font-display text-[clamp(2.3rem,4vw,3.2rem)] font-medium leading-none text-brand">
                {s.pre && <span className="mr-1 align-top text-xl text-gold-deep">{s.pre}</span>}
                {s.n}
                {s.u && <span className="text-gold-deep">{s.u}</span>}
              </div>
              <div className="mt-3 text-[0.8rem] font-bold uppercase tracking-[0.2em] text-ink">{s.t}</div>
              <p className="mx-auto mt-2 max-w-[210px] text-sm text-mut">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Popular addresses                                                  */
/* ------------------------------------------------------------------ */
export function PopularAreas() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-24">
      <SectionHead
        eyebrow="Locations"
        title={<>Popular <em className="text-champagne italic">addresses</em></>}
        desc="Jump straight into the neighbourhood you love."
      />
      <Stagger as="div" className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {AREA_TILES.map((a, i) => (
          <Link
            key={a.name}
            href={a.href}
            className={cx(
              "group relative block aspect-[4/5] overflow-hidden rounded-xl text-white",
              i === 0 && "lg:aspect-auto lg:row-span-2",
            )}
          >
            <Image
              src={a.image}
              alt={a.name}
              fill
              sizes="(max-width:640px)50vw,16vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f1a]/90 via-[#0d1f1a]/10 to-transparent" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 transition group-hover:ring-gold/50" />
            <div className="absolute inset-x-0 bottom-0 p-3.5">
              <div className="font-display text-[1rem] font-medium leading-tight">{a.name}</div>
              <div className="mt-0.5 text-[0.72rem] text-white/70">{a.listings} listings</div>
            </div>
          </Link>
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Why Manzil — considered, end-to-end                                */
/* ------------------------------------------------------------------ */
const FEATURES = [
  { icon: ShieldIcon, t: "Verification first", d: "Photos, title and possession documents are checked before a home ever goes live." },
  { icon: CheckIcon, t: "Full legal desk", d: "Title search, registry and transfer — handled in-house, end to end." },
  { icon: PhoneIcon, t: "Senior advisors", d: "Human specialists reachable on WhatsApp and phone, whenever you need them." },
];
export function WhyManzil() {
  return (
    <section className="bg-paper2 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <Reveal variant="left">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-lift">
              <Image
                src="/images/interior-living.jpg"
                alt="A considered Manzil home"
                width={1200}
                height={900}
                className="h-full w-full object-cover"
              />
            </div>
            {/* floating note */}
            <div className="absolute -bottom-6 -right-4 max-w-[230px] rounded-2xl border border-gold/30 bg-brand-2 p-5 text-white shadow-panel sm:-right-6">
              <div className="font-display text-3xl font-medium text-gold-2">98%</div>
              <p className="mt-1 text-[0.85rem] leading-snug text-white/80">of clients come back — or send their family and friends.</p>
            </div>
          </div>
        </Reveal>
        <div>
          <SectionHead
            eyebrow="Why Manzil"
            light
            title={<>A calmer, more <em className="text-champagne italic">trustworthy</em> way to move</>}
            desc="Real estate is emotional and full of noise. We strip the noise out and leave the certainty."
          />
          <div className="mt-8 space-y-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.t} variant="up" delay={`${i * 0.08}s`}>
                <div className="flex gap-4">
                  <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-brand-2 text-gold-2">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-bold text-white">{f.t}</div>
                    <p className="mt-0.5 max-w-md text-[0.95rem] text-white/70">{f.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal variant="up" delay="0.2s" className="mt-9">
            <Link href="/about" className="inline-flex items-center gap-2 font-semibold text-gold-2 link-grow">
              More about Manzil <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Closing CTA                                                        */
/* ------------------------------------------------------------------ */
export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <Reveal variant="zoom">
        <div className="relative overflow-hidden rounded-3xl bg-brand-2 px-8 py-16 text-center text-white md:px-16 md:py-20">
          <div className="absolute inset-0">
            <Image src="/images/hero.jpg" alt="" fill className="object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1f1a]/95 via-[#123028]/85 to-[#1c3f34]/90" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <Kicker light>Let’s find your Manzil</Kicker>
            <h2 className="mt-4 font-display font-medium leading-[1.05] text-[clamp(2rem,4.6vw,3.3rem)]">
              Ready to find your <em className="text-champagne italic">home?</em>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">
              Talk to an advisor, book a viewing, or get a free valuation — no obligations, ever.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/properties" className="btn btn-gold">Browse listings</Link>
              <Link href="/sell" className="btn btn-light">Get a free valuation</Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
