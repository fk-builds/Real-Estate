import { MapIcon, PinIcon } from "@/components/ui/icons";

/**
 * Interactive map — an embedded, pan/zoom map centred on the listing. When the
 * listing has coordinates we pin the exact spot; otherwise we geocode the
 * address string. Served lazily (iframe `loading="lazy"`).
 */
export function MapSection({
  latitude,
  longitude,
  query,
  title,
}: {
  latitude?: number;
  longitude?: number;
  query: string;
  title?: string;
}) {
  const hasCoords =
    typeof latitude === "number" && typeof longitude === "number" &&
    Number.isFinite(latitude) && Number.isFinite(longitude);

  const embedSrc = hasCoords
    ? `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;

  const directions = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-ink">
        <MapIcon className="h-6 w-6 text-emerald" /> Location
      </h2>
      <p className="mt-1 flex items-center gap-1.5 text-mut">
        <PinIcon className="h-4 w-4 text-gold-deep" />
        {query}
        <a href={directions} target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald hover:underline">
          Get directions ↗
        </a>
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-linesoft bg-white shadow-sm">
        <iframe
          title={`Map — ${title ?? query}`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="h-[380px] w-full border-0"
        />
      </div>
    </div>
  );
}
