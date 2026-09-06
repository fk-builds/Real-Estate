import { loadDb } from "@/lib/db/local-db";
import { ListingForm } from "@/components/admin/listing-form";

export default async function NewListingPage() {
  const db = await loadDb();
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-ink">Add a property</h1>
      <p className="mb-6 mt-1 text-mut">Fill in the basics — title, price, location & taxonomy, media and status.</p>
      <ListingForm catalogue={db.features} />
    </div>
  );
}
