import { notFound } from "next/navigation";
import Link from "next/link";
import { loadDb } from "@/lib/db/local-db";
import { ListingForm } from "@/components/admin/listing-form";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await loadDb();
  const listing = db.listings.find((l) => l.id === id);
  if (!listing) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/listings" className="text-sm font-bold text-emerald hover:underline">← Properties</Link>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">Edit property</h1>
        </div>
        <span className="badge badge-plain">{listing.published !== false ? "LIVE" : "DRAFT"}</span>
      </div>
      <ListingForm listing={listing} catalogue={db.features} />
    </div>
  );
}
