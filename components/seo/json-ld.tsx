import type { Listing } from "@/lib/data/types";
import { site } from "@/lib/site";

/** Render any JSON-LD object as a script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Rich snippet for a single listing page. */
export function listingJsonLd(l: Listing): Record<string, unknown> {
  const url = `${site.url}/property/${l.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: l.title,
    description: l.description,
    url,
    image: l.gallery.map((g) => (g.startsWith("http") ? g : `${site.url}${g}`)),
    brand: { "@type": "Organization", name: site.name },
    offers: {
      "@type": "Offer",
      price: l.price,
      priceCurrency: "PKR",
      url,
      availability: "https://schema.org/InStock",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Beds", value: l.beds },
      { "@type": "PropertyValue", name: "Baths", value: l.baths },
      { "@type": "PropertyValue", name: "Area", value: l.areaRaw },
      { "@type": "PropertyValue", name: "PropertyType", value: l.kind },
      { "@type": "PropertyValue", name: "Purpose", value: l.purpose },
    ],
  };
}

/** BreadcrumbList for nested /category/city/area pages. */
export function breadcrumbJsonLd(items: Array<{ name: string; path?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: `${site.url}${it.path}` } : {}),
    })),
  };
}
