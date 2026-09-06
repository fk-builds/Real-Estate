import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Sell your property with Manzil", description: "Get a free valuation and reach thousands of verified buyers across Pakistan.", alternates: { canonical: "/sell" } };

export default function SellPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-ink">
            Sell faster, at the <em className="text-gold-deep">right price</em>.
          </h1>
          <p className="mt-4 max-w-lg text-body">
            List your house, apartment, plot or project with Manzil. We verify, photograph, market and negotiate on
            your behalf — and show you every lead in real time.
          </p>
          <ul className="mt-6 space-y-3">
            {["Free, accurate valuation from on-ground data", "Professional photos & marketing", "Access to 2,400+ verified buyers and overseas investors", "Legal & transfer handled end-to-end"].map((f) => (
              <li key={f} className="flex items-start gap-3 text-body">
                <span className="mt-1 grid h-5 w-5 flex-none place-items-center rounded-full bg-emerald text-xs font-bold text-white">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lg">
          <Image src="/images/house-stone-grey.jpg" alt="List your home with Manzil" fill className="object-cover" />
        </div>
      </div>

      <div className="mt-16 rounded-3xl border border-linesoft bg-white p-8 shadow-sm">
        <h2 className="font-serif text-2xl font-semibold text-ink">Get a free valuation</h2>
        <p className="mt-1 text-sm text-mut">Tell us about your property and an advisor will call you within 15 minutes.</p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2">
          <input required placeholder="Full name" className="input" />
          <input required type="tel" placeholder="Phone / WhatsApp" className="input" />
          <input placeholder="Property location (city / area / project)" className="input sm:col-span-2" />
          <select className="input">
            <option>Property type</option><option>House / Villa</option><option>Flat / Apartment</option><option>Plot / Land</option><option>Farmhouse</option><option>Commercial</option>
          </select>
          <select className="input">
            <option>Approx size</option><option>5 Marla</option><option>10 Marla</option><option>1 Kanal</option><option>2 Kanal+</option><option>Other</option>
          </select>
          <button className="btn btn-gold sm:col-span-2">Request a callback</button>
        </form>
      </div>
    </div>
  );
}
