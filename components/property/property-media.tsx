import Image from "next/image";
import type { Listing, MediaItem } from "@/lib/data/types";
import { mediaGroups, formatBytes, assetName } from "@/lib/data/media";

/** Derive a lazy-embeddable iframe src for common hosts (else null). */
function embedUrl(url: string): string | null {
  const clean = url.trim();
  if (!/^https?:\/\//i.test(clean)) return null;
  const u = new URL(clean);
  const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");
  if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    if (u.pathname.startsWith("/embed/")) return clean;
    return null;
  }
  if (host === "vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (host === "dailymotion.com") {
    const id = (u.pathname.match(/(?:video|embed)\/([a-z0-9]+)/i) ?? [])[1];
    return id ? `https://www.dailymotion.com/embed/video/${id}` : null;
  }
  // allow generic providers that are designed to be embedded in an iframe
  if (/matterport\.com|3dvista\.com|kuula\.co|pano2vr/i.test(clean)) return clean;
  return null;
}

/**
 * Non-photo media (floor plans, PDF documents, videos, virtual tours) rendered
 * from a property's ordered `MediaItem[]`. Everything else — the photo gallery
 * — lives in components/property/gallery.tsx.
 */
export function PropertyMedia({ listing }: { listing: Listing }) {
  const { floorplans, documents, videos, tours } = mediaGroups(listing);
  const hasAny = floorplans.length + documents.length + videos.length + tours.length > 0;
  if (!hasAny) return null;

  return (
    <>
      {(floorplans.length > 0 || documents.length > 0) && (
        <section className="mt-8">
          <h2 className="font-serif text-2xl font-semibold text-ink">Floor plans &amp; documents</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {floorplans.map((fp) => (
              <figure key={fp.url} className="overflow-hidden rounded-2xl border border-linesoft bg-white shadow-sm">
                <a href={fp.url} target="_blank" rel="noreferrer" className="block bg-[#eef1f7]">
                  <Image
                    src={fp.url}
                    alt={fp.alt ?? `${listing.title} floor plan`}
                    width={fp.width ?? 800}
                    height={fp.height ?? 600}
                    sizes="(max-width:1024px) 100vw, 50vw"
                    className="h-auto w-full object-contain"
                  />
                </a>
                <figcaption className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="font-semibold text-ink">{fp.caption ?? fp.name ?? "Floor plan"}</span>
                  <a href={fp.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald hover:underline">
                    View full ↗
                  </a>
                </figcaption>
              </figure>
            ))}

            {documents.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-widest text-mut">Downloads</div>
                {documents.map((d) => (
                  <DocRow key={d.url} item={d} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {(videos.length > 0 || tours.length > 0) && (
        <section className="mt-8">
          <h2 className="font-serif text-2xl font-semibold text-ink">Media &amp; virtual tour</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {videos.map((v) => (
              <VideoCard key={v.url} item={v} title={listing.title} />
            ))}
            {tours.map((t) => (
              <TourCard key={t.url} item={t} title={listing.title} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function DocRow({ item }: { item: MediaItem }) {
  const size = formatBytes(item.size);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-linesoft bg-white p-4 shadow-sm">
      <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-red-50 text-red-500">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 15h6" /><path d="M9 11h6" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-ink">{item.name ?? assetName(item.url)}</div>
        <div className="truncate text-xs text-mut">
          {item.caption ?? "Document"}{size ? ` · ${size}` : ""}
        </div>
      </div>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        download
        className="btn btn-ghost px-3 py-1.5 text-xs"
      >
        Download
      </a>
    </div>
  );
}

function VideoCard({ item, title }: { item: MediaItem; title: string }) {
  const src = embedUrl(item.url);
  const label = item.caption ?? item.name ?? "Walkthrough video";
  return (
    <div className="overflow-hidden rounded-2xl border border-linesoft bg-white shadow-sm">
      {src ? (
        <div className="relative aspect-video bg-black">
          <iframe
            src={src}
            title={label}
            loading="lazy"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="grid aspect-video place-items-center bg-gradient-to-br from-emerald-2 to-emerald-3 text-white">
          <a href={item.url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 px-6 text-center">
            <PlayIcon />
            <span className="font-bold">Watch on external player ↗</span>
          </a>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="font-semibold text-ink">{label}</span>
        {src && (
          <a href={item.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald hover:underline">
            Open ↗
          </a>
        )}
      </div>
    </div>
  );
}

function TourCard({ item, title }: { item: MediaItem; title: string }) {
  const src = embedUrl(item.url);
  const label = item.caption ?? item.name ?? "Virtual tour";
  return (
    <div className="overflow-hidden rounded-2xl border border-linesoft bg-white shadow-sm">
      {src ? (
        <div className="relative aspect-video bg-[#0b1020]">
          <iframe
            src={src}
            title={`${label} of ${title}`}
            loading="lazy"
            className="h-full w-full border-0"
            allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen; autoplay; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a href={item.url} target="_blank" rel="noreferrer"
          className="grid aspect-video place-items-center bg-gradient-to-br from-gold-deep to-[#c9952f] text-white">
          <div className="flex flex-col items-center gap-2">
            <TourIcon />
            <span className="font-bold">Launch interactive tour ↗</span>
          </div>
        </a>
      )}
      <div className="px-4 py-3 text-sm font-semibold text-ink">{label}</div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M10 8.5v7l6-3.5z" />
    </svg>
  );
}
function TourIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18M3 12h18" />
    </svg>
  );
}
