import type { Metadata } from "next";
import type { Listing } from "@/lib/data/types";
import { site, kindLabels, purposeLabels } from "@/lib/site";

/**
 * SEO building blocks for a single property (Objective 19).
 * Centralises, for EVERY listing:
 *   - SEO <title> & <meta description>
 *   - canonical URL
 *   - Open Graph (title/description/image/type/locale/absolute url)
 *   - Twitter card
 *   - Schema.org structured data (Product + Offer + Place + RealEstateAgent + Breadcrumb)
 *
 * `abs(url)` normalises asset paths to absolute so OG/Twitter images and
 * canonical URLs stay crawlable regardless of request host.
 */
export function abs(url: string | undefined | null): string {
  if (!url) return `${site.url}/og-default.jpg`;
  return /^https?:\/\//.test(url) ? url : `${site.url}${url}`;
}

export interface PropertySeoContext {
  /** Deep location path leading to the listing, e.g. Lahore → DHA → Phase 8 → Block J. */
  trail?: Array<{ name: string; path?: string }>;
  agent?: { name?: string; role?: string; phone?: string; email?: string };
}

/** Dynamic <Metadata> for a property detail page. */
export function propertyMetadata(l: Listing, ctx: PropertySeoContext = {}): Metadata {
  const kind = kindLabels[l.kind] ?? l.kind;
  const purpose = purposeLabels[l.purpose as keyof typeof purposeLabels] ?? "Property";
  const title = `${l.title} | ${l.cityName} — ${site.name}`;
  const description = [
    `${purpose} ${kind.toLowerCase()} in ${l.areaLabel}, ${l.cityName}.`,
    `${l.priceDisplay} · ${l.areaRaw || "area on request"}${l.beds ? ` · ${l.beds} bed` : ""}${l.baths ? ` · ${l.baths} bath` : ""}.`,
    l.headline ?? "Verified listing by a senior Manzil advisor.",
  ].join(" ");
  const url = `${site.url}/property/${l.slug}`;
  const image = abs(l.coverImage || l.gallery?.[0]);
  const ogDescription = `${purpose} ${kind.toLowerCase()} in ${l.areaLabel}, ${l.cityName} — ${l.priceDisplay}.`;
  void ctx;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/property/${l.slug}` },
    openGraph: {
      title,
      description: ogDescription,
      url,
      type: "website",
      siteName: site.name,
      locale: "en_PK",
      images: [{ url: image, width: 1200, height: 630, alt: l.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
      images: [image],
    },
  };
}

/** BreadcrumbList items for Home → City → Project → Phase → Block → Listing. */
export function propertyBreadcrumb(l: Listing, ctx: PropertySeoContext = {}): Array<{ name: string; path?: string }> {
  const items: Array<{ name: string; path?: string }> = [{ name: "Home", path: "/" }];
  if (ctx.trail) items.push(...ctx.trail);
  items.push({ name: l.title });
  return items;
}

/**
 * Schema.org document for a property page — an @graph combining the listing
 * (Product), its Offer, the Place/address, the promoting RealEstateAgent and a
 * BreadcrumbList for the deep location path.
 */
export function propertyGraphLd(l: Listing, ctx: PropertySeoContext = {}): Record<string, unknown> {
  const url = `${site.url}/property/${l.slug}`;
  const image = abs(l.coverImage || l.gallery?.[0]);
  const kind = kindLabels[l.kind] ?? l.kind;
  const purpose = purposeLabels[l.purpose as keyof typeof purposeLabels] ?? "Property";
  const availability =
    l.status === "available"
      ? "https://schema.org/InStock"
      : l.status === "under_offer"
        ? "https://schema.org/Reserved"
        : "https://schema.org/SoldOut";

  const graph: Record<string, unknown>[] = [];

  if (ctx.agent?.name) {
    graph.push({
      "@type": "RealEstateAgent",
      "@id": `${url}#agent`,
      name: ctx.agent.name,
      ...(ctx.agent.role ? { knowsAbout: ctx.agent.role } : {}),
      ...(ctx.agent.phone ? { telephone: ctx.agent.phone } : {}),
      ...(ctx.agent.email ? { email: ctx.agent.email } : {}),
      parentOrganization: { "@type": "Organization", name: site.name, url: site.url },
    });
  }

  const offer: Record<string, unknown> = {
    "@type": "Offer",
    "@id": `${url}#offer`,
    price: l.price,
    priceCurrency: "PKR",
    url,
    availability,
    itemCondition: "https://schema.org/UsedCondition",
    seller: ctx.agent?.name ? { "@id": `${url}#agent` } : { "@type": "Organization", name: site.name },
  };
  if (l.pricePeriod === "monthly") {
    offer.priceSpecification = {
      "@type": "UnitPriceSpecification",
      price: l.price,
      priceCurrency: "PKR",
      unitText: "month",
    };
  }
  graph.push(offer);

  const product: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${url}#listing`,
    name: l.title,
    description: l.description,
    url,
    image,
    brand: { "@type": "Brand", name: site.name },
    offers: { "@id": `${url}#offer` },
    additionalProperty: [
      { "@type": "PropertyValue", name: "propertyType", value: kind },
      { "@type": "PropertyValue", name: "listingType", value: purpose },
      { "@type": "PropertyValue", name: "propertyId", value: l.id },
      ...(l.plotNumber ? [{ "@type": "PropertyValue", name: "plotNumber", value: l.plotNumber }] : []),
      ...(l.verified ? [{ "@type": "PropertyValue", name: "verificationStatus", value: "verified" }] : []),
    ],
  };
  graph.push(product);

  const place: Record<string, unknown> = {
    "@type": "Place",
    "@id": `${url}#place`,
    name: `${l.areaLabel}, ${l.cityName}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: l.cityName,
      addressRegion: ctx.trail?.[0]?.name,
      streetAddress: l.street || undefined,
      addressCountry: "PK",
    },
  };
  if (typeof l.latitude === "number" && typeof l.longitude === "number") {
    place.geo = { "@type": "GeoCoordinates", latitude: l.latitude, longitude: l.longitude };
  }
  graph.push(place);

  const crumbs = propertyBreadcrumb(l, ctx);
  graph.push({
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: crumbs.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: `${site.url}${it.path}` } : {}),
    })),
  });

  return { "@context": "https://schema.org", "@graph": graph };
}
