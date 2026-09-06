import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolvePhase } from "@/lib/data/phase-page";
import { UnitPage } from "@/components/project/unit-page";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; phase: string }> }): Promise<Metadata> {
  const { slug, phase } = await params;
  const m = await resolvePhase(slug, phase);
  if (!m) return { title: "Not found" };
  return {
    title: `${m.name} — ${m.societyName}`,
    description: m.overview[0] ?? `${m.name} of ${m.societyName}.`,
    alternates: { canonical: `/projects/${slug}/${phase}` },
    openGraph: { title: `${m.name} — ${m.societyName}`, description: m.tagline, images: [{ url: m.cover }] },
  };
}

export default async function PhaseRoute({ params }: { params: Promise<{ slug: string; phase: string }> }) {
  const { slug, phase } = await params;
  const m = await resolvePhase(slug, phase);
  if (!m) notFound();
  return <UnitPage unit={m} />;
}
