"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon, PinIcon, BuildingIcon, BedIcon } from "./home-icons";
import { kindLabels, purposeLabels } from "@/lib/site";
import { cx } from "@/lib/utils";
import { useReveal } from "@/lib/client/reveal";

const types = ["house", "residential-plot", "villa", "apartment", "flat", "commercial-plot", "office", "shop", "farmhouse"];
const MODES = ["sale", "rent", "lease"] as const;
type Mode = (typeof MODES)[number];

export function Hero() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sale");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [beds, setBeds] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    p.set("purpose", mode);
    if (q.trim()) p.set("q", q.trim());
    if (kind) p.set("kind", kind);
    if (beds) p.set("beds", beds);
    router.push(`/properties?${p.toString()}`);
  };

  return (
    <section className="relative isolate overflow-hidden bg-brand-2 text-white">
      {/* layered background media */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt="Premium villa in Pakistan at dusk"
          fill priority sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e1f1a] via-[#0e1f1a]/85 to-[#0e1f1a]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(182,141,69,.22),transparent_60%)]" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-20">
        {/* Copy */}
        <div>
          <Reveal as="div" variant="up">
            <span className="inline-flex items-center gap-3 text-[0.78rem] font-semibold uppercase tracking-lux text-gold-2">
              <span className="h-px w-10 bg-gold-2" /> Pakistan&rsquo;s premium property house
            </span>
          </Reveal>
          <Reveal as="h1" variant="up" delay=".1s" className="mt-7">
            <span className="block font-display text-[clamp(2.5rem,6vw,4.7rem)] font-medium leading-[1.02] tracking-tight">
              A home worth
              <br />
              <em className="text-champagne italic">the address.</em>
            </span>
          </Reveal>
          <Reveal as="p" variant="up" delay=".2s" className="mt-6 max-w-lg text-[1.06rem] leading-relaxed text-white/80">
            Discover hand-verified residences, plots and new developments across Pakistan —
            curated by senior advisors and backed by airtight legal support.
          </Reveal>
          <Reveal as="div" variant="up" delay=".3s" className="mt-9 flex flex-wrap items-center gap-8">
            {[
              { v: "2,400+", l: "Verified listings" },
              { v: "PKR 9.2B", l: "Closed in 2025" },
              { v: "98%", l: "Client retention" },
            ].map((s) => (
              <div key={s.l} className="border-l border-white/15 pl-4">
                <div className="font-display text-3xl font-medium text-white">{s.v}</div>
                <div className="mt-1 text-[0.78rem] uppercase tracking-wide text-white/55">{s.l}</div>
              </div>
            ))}
          </Reveal>
        </div>

        {/* Elevated search card */}
        <Reveal as="div" variant="up" delay=".25s">
          <div className="relative">
            <div className="rounded-2xl border border-white/25 bg-white/[.06] p-3 backdrop-blur-xl">
              <div className="rounded-xl bg-white p-5 text-ink shadow-2xl">
                <div className="mb-4 flex items-center gap-3 border-b border-line pb-4">
                  {MODES.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={cx(
                        "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                        mode === m ? "bg-brand text-white shadow" : "text-mut hover:text-brand",
                      )}
                    >
                      {purposeLabels[m]}
                    </button>
                  ))}
                </div>
                <form onSubmit={submit} className="space-y-3">
                  <label className="ctl">
                    <PinIcon />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="City, area or project" list="hero-places" />
                    <datalist id="hero-places">
                      <option value="DHA Lahore" /><option value="Bahria Town Rawalpindi" />
                      <option value="Gulberg Greens Islamabad" /><option value="Clifton Karachi" />
                      <option value="F-7 Islamabad" />
                    </datalist>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="ctl">
                      <BuildingIcon />
                      <select value={kind} onChange={(e) => setKind(e.target.value)}>
                        <option value="">Any type</option>
                        {types.map((t) => (<option key={t} value={t}>{kindLabels[t]}</option>))}
                      </select>
                    </label>
                    <label className="ctl">
                      <BedIcon />
                      <select value={beds} onChange={(e) => setBeds(e.target.value)}>
                        <option value="">Any beds</option>
                        {[1,2,3,4,5,6].map((b)=>(<option key={b} value={b}>{b}+ Beds</option>))}
                      </select>
                    </label>
                  </div>
                  <button type="submit" className="btn btn-gold w-full justify-center py-3.5 text-base">
                    <SearchIcon className="h-5 w-5" /> Search Properties
                  </button>
                </form>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-3 hidden items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-lift sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold-deep">
                <BuildingIcon className="h-5 w-5" />
              </span>
              <div className="text-[0.85rem] leading-tight">
                <div className="font-bold text-ink">4.9 ★ client rated</div>
                <div className="text-mut">Lahore · Islamabad · Karachi</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Reveal({ children, className, delay, variant, as: Tag = "div" }: any) {
  const ref = useReveal<any>();
  const base = variant === "up" ? "reveal" : "reveal";
  return (
    <Tag ref={ref as any} className={cx(base, className)} style={delay ? { transitionDelay: delay } : undefined}>
      {children}
    </Tag>
  );
}
