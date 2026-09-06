import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import {
  FeaturedListings, Developments, PopularAreas, WhyManzil, CtaBanner, ManzilStats, TrustMarquee,
} from "@/components/home/sections";
import { PropertyCategories, Testimonials, FaqSection } from "@/components/home/extra-sections";
import { getStore } from "@/lib/data/provider";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic"; // reflect CMS/content edits live

export const metadata: Metadata = {
  title: {
    absolute: `${site.name} · Premium Real Estate in Pakistan — Houses, Plots & New Developments`,
  },
  description:
    "Search 2,400+ verified houses, apartments, plots and new developments across Islamabad, Lahore, Karachi and more. Premium agency-plus-marketplace with senior advisors and full legal support.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Manzil · Premium Estates",
    description: "The premium way to buy, sell and invest in Pakistani property.",
    url: "/",
    images: [{ url: "/images/hero.jpg", width: 1376, height: 768, alt: "Manzil premium property" }],
  },
};

export default async function HomePage() {
  const store = await getStore();
  const [featured, projects] = await Promise.all([
    store.getFeatured(6),
    store.getProjects(),
  ]);

  return (
    <>
      <Hero />
      <TrustMarquee />
      <FeaturedListings listings={featured} />
      <Developments projects={projects} />
      <ManzilStats />
      <PopularAreas />
      <PropertyCategories />
      <WhyManzil />
      <Testimonials />
      <FaqSection />
      <CtaBanner />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: site.name,
          url: site.url,
          image: `${site.url}/images/hero.jpg`,
          description: site.description,
          telephone: site.contact.phone,
          email: site.contact.email,
          areaServed: ["Islamabad", "Lahore", "Karachi", "Rawalpindi"],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Islamabad",
            addressCountry: "PK",
          },
          numberOfEmployees: 186,
        }}
      />
    </>
  );
}
