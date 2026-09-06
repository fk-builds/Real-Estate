"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/utils";
import { Reveal, Stagger } from "@/lib/client/reveal";
import { SectionHead } from "@/components/home/primitives";
import { ArrowRightIcon, ChevronDownIcon, StarIcon } from "@/components/ui/icons";

/* ------------------------------------------------------------------ */
/*  Property categories (premium tiles)                                */
/* ------------------------------------------------------------------ */
const CATS = [
  { label: "Houses", img: "/images/villa-modern-white.jpg", href: "/properties?kind=house" },
  { label: "Villas", img: "/images/house-stone-grey.jpg", href: "/properties?kind=villa" },
  { label: "Apartments", img: "/images/apartment-tower.jpg", href: "/properties?kind=apartment" },
  { label: "Plots", img: "/images/society-aerial.jpg", href: "/properties?kind=residential-plot" },
  { label: "Commercial", img: "/images/city-marquee.jpg", href: "/properties?kind=commercial-plot" },
  { label: "New Projects", img: "/images/interior-living.jpg", href: "/projects" },
];
export function PropertyCategories() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Browse by type"
          title={<>Find your <em className="text-champagne italic">category</em></>}
          desc="From family houses to income plots and flagship developments."
        />
        <Stagger as="div" className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CATS.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group relative block aspect-[3/4] overflow-hidden rounded-xl text-white"
            >
              <Image
                src={c.img}
                alt={c.label}
                fill
                sizes="(max-width:768px)50vw,16vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f1a]/92 via-[#0d1f1a]/10 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 transition group-hover:ring-gold/50" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="font-display text-lg font-medium leading-tight">{c.label}</div>
                <span className="mt-1 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-gold-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
                  Explore <ArrowRightIcon className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials                                                       */
/* ------------------------------------------------------------------ */
const TESTS = [
  { n: "Hamza Sheikh", r: "Bought a house · DHA Lahore", q: "The advisor walked us through title search and registry step by step. Completely stress-free — we closed in three weeks." },
  { n: "Dr. Ayesha Malik", r: "Invested · Islamabad", q: "The first platform where listings actually matched reality. The verification gave me genuine peace of mind." },
  { n: "Bilal Raza", r: "Sold · Gulberg", q: "Professional photography and qualified buyers — we sold above asking in under a month." },
];
export function Testimonials() {
  return (
    <section className="bg-paper2 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Client stories"
          center
          title={<>In their <em className="text-champagne italic">words</em></>}
        />
        <Stagger as="div" className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTS.map((t) => (
            <figure
              key={t.n}
              className="flex flex-col rounded-2xl border border-line bg-white p-8 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 font-display text-[1.18rem] italic leading-relaxed text-ink">
                “{t.q}”
              </blockquote>
              <figcaption className="mt-6 border-t border-linesoft pt-4">
                <div className="font-bold text-ink">{t.n}</div>
                <div className="text-[0.85rem] text-mut">{t.r}</div>
              </figcaption>
            </figure>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */
const FAQS = [
  { q: "Is every property on Manzil verified?", a: "Yes. Each listing is reviewed by an advisor and our legal desk — title, possession documents and NOC are verified before anything goes live." },
  { q: "Which cities does Manzil cover?", a: "We operate across Islamabad, Lahore, Rawalpindi, Karachi, Peshawar and Faisalabad, with on-ground teams in each market." },
  { q: "How does the legal process work?", a: "Our in-house desk handles title search, transfer, registration and possession end to end, so you are protected at every step." },
  { q: "Can I schedule a site visit?", a: "Yes — open any property and tap WhatsApp or Call, or send an enquiry. A dedicated advisor will arrange a viewing at your convenience." },
  { q: "What does it cost to browse or enquire?", a: "Browsing and enquiring is completely free. We only earn when a deal closes, with transparent success fees agreed up front." },
];
export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SectionHead
            eyebrow="Good to know"
            title={<>Answers, <em className="text-champagne italic">considered</em></>}
            desc="The questions we hear most from buyers, sellers and investors."
          />
          <Reveal variant="up" className="mt-6 hidden lg:block">
            <Link href="/help" className="btn btn-ghost btn-sm">
              Visit help centre <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} variant="up">
              <div
                className={cx(
                  "overflow-hidden rounded-2xl border bg-white transition duration-300",
                  open === i ? "border-gold shadow-card" : "border-line",
                )}
              >
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  aria-expanded={open === i}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-display text-lg font-medium text-ink">{f.q}</span>
                  <span
                    className={cx(
                      "grid h-7 w-7 flex-none place-items-center rounded-full border transition-all duration-300",
                      open === i ? "rotate-180 border-gold bg-brand text-gold-2" : "border-line text-gold-deep",
                    )}
                  >
                    <ChevronDownIcon className="h-4 w-4" />
                  </span>
                </button>
                <div
                  className={cx(
                    "grid transition-all duration-300 ease-out",
                    open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-[0.95rem] leading-relaxed text-body">{f.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
