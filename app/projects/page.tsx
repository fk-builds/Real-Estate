import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getStore } from "@/lib/data/provider";
import { listSocieties } from "@/lib/data/project-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "New Developments & Projects in Pakistan",
  description: "Approved societies, pre-launch plots and branded towers across Pakistan — with developer track records and flexible payment plans.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsIndex() {
  const store = await getStore();
  const projects = await store.getProjects();
  const societies = await listSocieties();

  return (
    <>
      <div className="bg-gradient-to-r from-[#3a2f12] via-[#6d5518] to-[#9a7c2a] py-14 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-serif text-[clamp(1.9rem,3.6vw,2.8rem)] font-semibold">Projects &amp; Housing Societies</h1>
          <p className="mt-2 max-w-2xl text-white/85">
            Explore Pakistan&rsquo;s leading housing societies and new developments — with phases, available inventory, amenities and verified listings.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* housing societies */}
        {societies.length > 0 && (
          <>
            <h2 className="font-serif text-2xl font-semibold text-ink">Housing societies</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {societies.map((s) => (
                <Link key={s.slug} href={`/projects/${s.slug}`} className="group overflow-hidden rounded-2xl border border-linesoft bg-white shadow-sm">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={s.cover} alt={s.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="25vw" />
                    <span className="badge bg-white/90 text-emerald absolute left-3 top-3">SOCIETY</span>
                  </div>
                  <div className="p-4">
                    <div className="font-extrabold text-ink group-hover:text-emerald">{s.name}</div>
                    <div className="mt-0.5 text-sm text-mut">{s.place}</div>
                    <div className="mt-3 text-xs font-bold text-emerald">Explore phases &amp; inventory →</div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="my-10 border-t border-line" />
          </>
        )}

        <h2 className="font-serif text-2xl font-semibold text-ink">New developments</h2>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.slug}`} className="prop-card group">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={p.image} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px)100vw,50vw" />
                  <span className="badge badge-plain absolute left-3 top-3">PROJECT</span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="font-serif text-lg font-bold text-emerald">{p.priceFrom && `From ${p.priceFrom}`}</div>
                  <div className="font-extrabold leading-snug text-ink">{p.name}</div>
                  <p className="text-sm text-body line-clamp-2">{p.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-3 text-sm">
                    <span className="text-mut">{p.units} · {p.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <aside className="h-max space-y-5">
            <div className="rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
              <h3 className="font-serif text-xl font-semibold text-ink">Smart buying checklist</h3>
              <p className="mt-2 text-sm text-body">
                Before investing in any society, our advisors verify the NOC/LA from the relevant authority, the
                developer&rsquo;s track record, possession timeline and per-unit price benchmarks — so you always
                compare apples to apples.
              </p>
              <a href="#contact" className="btn btn-emerald mt-5 w-full">Book a consultation</a>
            </div>
            <div className="rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
              <h3 className="font-serif text-xl font-semibold text-ink">Payment plans</h3>
              <p className="mt-2 text-sm text-body">
                Flexible 3–5 year instalment plans on most developments, with down-payments from 20% and
                possession-linked milestones.
              </p>
              <p className="mt-4 rounded-xl bg-cream p-3 text-xs text-mut">Marketing · {site.name}</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

