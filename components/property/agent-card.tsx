import Image from "next/image";
import Link from "next/link";
import type { Agent } from "@/lib/data/agents";
import { whatsappLink } from "@/lib/data/agents";
import { PhoneIcon, WhatsAppIcon, EmailIcon, StarIcon, CheckIcon } from "@/components/ui/icons";

export interface AgentOtherListing {
  slug: string;
  title: string;
  priceDisplay: string;
  areaLabel: string;
  coverImage: string;
}

export function AgentCard({
  agent,
  listingTitle,
  listingUrl,
  other = [],
}: {
  agent: Agent;
  listingTitle: string;
  listingUrl: string;
  other?: AgentOtherListing[];
}) {
  const waText = `Hi ${agent.name.split(" ")[0]}, I'm interested in "${listingTitle}" (${listingUrl}). Please share more details.`;
  const mailSubject = encodeURIComponent(`Enquiry: ${listingTitle}`);

  return (
    <div className="rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        {agent.photo ? (
          <Image
            src={agent.photo}
            alt={agent.name}
            width={64}
            height={64}
            className="h-16 w-16 flex-none rounded-full object-cover ring-2 ring-cream"
          />
        ) : (
          <div className="grid h-16 w-16 flex-none place-items-center rounded-full bg-gradient-to-br from-emerald to-gold-deep font-serif text-xl font-bold text-white">
            {agent.initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-widest text-emerald">Listed by</p>
          <h3 className="truncate font-serif text-xl font-semibold text-ink">{agent.name}</h3>
          <p className="text-[0.83rem] text-mut">{agent.role}</p>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-mut">
            <StarIcon className="h-3.5 w-3.5 text-star" />
            <b className="text-ink">{agent.stars}</b>
            <span>· {agent.closings} closings</span>
            <span className="text-mut/60">· {agent.languages}</span>
          </div>
        </div>
      </div>

      {/* contact methods */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <a href={`tel:${agent.phoneHref}`} className="flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-emerald bg-emerald px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-3">
          <PhoneIcon className="h-4 w-4" /> Call Now
        </a>
        <a href={whatsappLink(agent.whatsapp, waText)} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1faa53] px-3 py-2.5 text-sm font-bold text-white transition hover:brightness-95">
          <WhatsAppIcon className="h-4 w-4" /> WhatsApp
        </a>
        <a href={`mailto:${agent.email}?subject=${mailSubject}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-bold text-ink-soft transition hover:border-emerald hover:text-emerald">
          <EmailIcon className="h-4 w-4" /> Email
        </a>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[0.8rem] text-mut">
        <CheckIcon className="h-4 w-4 flex-none text-emerald" />
        {agent.name.split(" ")[0]} verified this listing and handles the full transfer.
      </div>

      {other.length > 0 && (
        <div className="mt-5 border-t border-linesoft pt-4">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-widest text-mut">
            More from {agent.name.split(" ")[0]}
          </p>
          <ul className="mt-3 space-y-3">
            {other.map((l) => (
              <li key={l.slug}>
                <Link href={`/property/${l.slug}`} className="group flex items-center gap-3">
                  <Image src={l.coverImage} alt="" width={64} height={46}
                    className="h-12 w-[74px] flex-none rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-ink group-hover:text-emerald">{l.title}</div>
                    <div className="truncate text-xs text-mut">{l.areaLabel} · <b className="text-emerald">{l.priceDisplay}</b></div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
