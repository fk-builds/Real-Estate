import type { Metadata } from "next";
export const metadata: Metadata = { title: "About Manzil", description: "Manzil is a premium Pakistani property agency and marketplace.", alternates: { canonical: "/about" } };

const values = [
  { t: "Verified first", d: "No fake listings. Every property is physically checked and title-verified by our advisors." },
  { t: "Full accountability", d: "A named advisor and legal desk behind every transaction, from viewing to possession." },
  { t: "Technology + humans", d: "Fast search and clear data, paired with senior expertise where it matters most." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-semibold text-ink">Manzil means <em className="text-gold-deep">home</em>.</h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-body">
        Manzil (منزل) is a premium real-estate agency and marketplace for the Pakistani property market. We built the
        platform you would want to buy a home from: fast, honest search across houses, apartments, plots and new
        developments — backed by senior advisors who verify every listing and handle the paperwork end-to-end.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {values.map((v) => (
          <div key={v.t} className="rounded-2xl border border-linesoft bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-emerald">{v.t}</h2>
            <p className="mt-2 text-sm text-body">{v.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
