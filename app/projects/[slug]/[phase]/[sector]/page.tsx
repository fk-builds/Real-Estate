import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveUnitPath } from "@/lib/data/phase-page";
import { UnitPage } from "@/components/project/unit-page";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; phase: string; sector: string }> }): Promise<Metadata> {
  const { slug, phase, sector } = await params;
  const m = await resolveUnitPath(slug, [phase, sector]);
  if (!m) return { title: "Not found" };
  return {
    title: `${m.name} — ${m.societyName}`,
    description: m.overview[0] ?? `${m.name} of ${m.societyName}.`,
    alternates: { canonical: `/projects/${slug}/${phase}/${sector}` },
    openGraph: { title: `${m.name} — ${m.societyName}`, description: m.tagline, images: [{ url: m.cover }] },
  };
}

export default async function SectorRoute({ params }: { params: Promise<{ slug: string; phase: string; sector: string }> }) {
  const { slug, phase, sector } = await params;
  const m = await resolveUnitPath(slug, [phase, sector]);
  if (!m) notFound();
  return <UnitPage unit={m} />;
}
