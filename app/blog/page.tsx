import type { Metadata } from "next";
export const metadata: Metadata = { title: "News & Market Reports", description: "Pakistan property market reports, guides and investment insights from Manzil." };
const posts = [
  { t: "Islamabad & Lahore plot prices — H2 2026 outlook", c: "Market", d: "Where per-marla values are heading and which sectors to watch." },
  { t: "How to verify a housing society NOC before buying", c: "Buyers guide", d: "The exact documents and authority checks to run before you pay a booking." },
  { t: "Buying property remotely as an overseas Pakistani", c: "Overseas", d: "From biometric to POA to money transfer — the full checklist." },
  { t: "10 Marla vs 1 Kanal: choosing the right plot size", c: "Investing", d: "Construction cost, resale demand and rental yield compared." },
];
export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold text-ink">News &amp; market reports</h1>
      <p className="mt-2 text-mut">Guides and data to help you buy, sell and invest with confidence.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {posts.map((p) => (
          <a key={p.t} href="#" className="group rounded-2xl border border-linesoft bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <span className="text-xs font-extrabold uppercase tracking-wide text-gold-deep">{p.c}</span>
            <h2 className="mt-2 font-serif text-xl font-semibold leading-snug text-ink group-hover:text-emerald">{p.t}</h2>
            <p className="mt-2 text-sm text-body">{p.d}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
