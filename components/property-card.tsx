import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/data/types";
import { isPlotKind } from "@/lib/data/types";
import { cx } from "@/lib/utils";
import { kindLabels, statusLabel } from "@/lib/site";
import { BedIcon, BathIcon, AreaIcon, PinIcon, ShieldIcon, ArrowRightIcon } from "@/components/ui/icons";
import { plotLocationChain } from "@/lib/search/property-number";
import { SaveButton } from "@/components/save-button";
import { CompareButton } from "@/components/compare-button";

export function PropertyCard({ listing, className }: { listing: Listing; className?: string }) {
  const isRent = listing.purpose === "rent" || listing.purpose === "lease";
  const badgeCls = isRent
    ? "badge-rent"
    : listing.tagKind === "new"
      ? "badge-plain"
      : listing.tagKind === "hot"
        ? "badge-rent"
        : "badge-sale";
  const purposeTxt =
    listing.purpose === "rent" ? "For Rent" : listing.purpose === "lease" ? "For Lease" : "For Sale";
  const label =
    listing.tagLabel ??
    (isPlotKind(listing.kind) && listing.purpose === "sale"
      ? `${purposeTxt} · ${kindLabels[listing.kind] ?? "Plot"}`
      : purposeTxt);
  const showStatus = listing.status && listing.status !== "available";
  const href = `/property/${listing.slug}`;
  const chain = plotLocationChain(listing);

  return (
    <article
      className={cx(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift",
        className,
      )}
    >
      {/* image */}
      <div className="relative aspect-[16/11] overflow-hidden">
        <Link href={href} aria-label={listing.title} className="absolute inset-0 z-[1]">
          <Image
            src={listing.coverImage}
            alt={`${listing.title} in ${listing.areaLabel}, ${listing.cityName}`}
            fill
            sizes="(max-width:640px) 100vw,(max-width:1080px) 50vw,33vw"
            className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#0d1f1a]/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* badges */}
        <span className={cx("badge absolute left-3 top-3 z-[2] uppercase", badgeCls)}>{label}</span>
        {showStatus && (
          <span className="badge absolute left-3 top-11 z-[2] bg-black/55 text-white backdrop-blur">
            {statusLabel(listing.status)}
          </span>
        )}
        {isPlotKind(listing.kind) && listing.plotNumber && (
          <span className="badge badge-plain absolute bottom-3 left-3 z-[2]">📍 {listing.plotNumber}</span>
        )}

        <SaveButton listingId={listing.id} />
        <CompareButton listingId={listing.id} />
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="font-display text-[1.45rem] font-medium leading-none text-brand">
            {listing.priceDisplay}
          </div>
          {listing.verified && (
            <span className="inline-flex flex-none items-center gap-1 text-[0.7rem] font-bold uppercase tracking-wide text-gold-deep">
              <ShieldIcon className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>

        <Link
          href={href}
          className="mt-2 line-clamp-2 font-bold leading-snug text-ink transition-colors duration-300 hover:text-brand"
        >
          {listing.title}
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5 text-[0.86rem] text-mut">
          <PinIcon className="h-3.5 w-3.5 text-gold-deep" />
          {listing.areaLabel}, {listing.cityName}
        </div>

        {chain.length > 1 && (
          <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1 text-[0.72rem] font-semibold text-brand">
            {chain.slice(0, -1).map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-mut/40">›</span>}
                {c}
              </span>
            ))}
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-brand"># {chain[chain.length - 1]}</span>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-linesoft pt-4">
          {listing.beds > 0 && (
            <Spec icon={<BedIcon className="h-[17px] w-[17px]" />} txt={`${listing.beds} Beds`} />
          )}
          {listing.baths > 0 && (
            <Spec icon={<BathIcon className="h-[17px] w-[17px]" />} txt={`${listing.baths} Baths`} />
          )}
          {listing.areaRaw && <Spec icon={<AreaIcon className="h-[17px] w-[17px]" />} txt={listing.areaRaw} />}
        </div>
      </div>

      {/* hover action strip revealed on hover */}
      <div className="pointer-events-none relative h-0 overflow-visible">
        <Link
          href={href}
          className="absolute inset-x-5 bottom-4 z-[3] flex -translate-y-3 items-center justify-center gap-2 rounded-full bg-brand-2/95 py-2.5 text-sm font-semibold text-gold-2 opacity-0 backdrop-blur transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100"
        >
          View details <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function Spec({ icon, txt }: { icon: React.ReactNode; txt: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[0.84rem] font-semibold text-ink-soft">
      <span className="text-gold-deep">{icon}</span> {txt}
    </span>
  );
}
