import type { Metadata } from "next";
import { StarIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Our Advisors", description: "Meet Manzil's senior property advisors across Pakistan.", alternates: { canonical: "/agents" } };

const agents = [
  { ini: "AR", name: "Ayesha Raza", role: "Senior Advisor · Islamabad & Lahore", stars: 4.9, closings: 148, lang: "English · Urdu" },
  { ini: "BK", name: "Bilal Khan", role: "Head of Legal & Due Diligence", stars: 4.9, closings: 320, lang: "English · Urdu · Punjabi" },
  { ini: "SF", name: "Sara Farooq", role: "Overseas Sales · UK / UAE desk", stars: 4.8, closings: 96, lang: "English" },
  { ini: "OM", name: "Omar Mehmood", role: "Commercial & Investment", stars: 4.9, closings: 210, lang: "English · Urdu" },
  { ini: "HK", name: "Hina Khalid", role: "Karachi Region Lead", stars: 4.8, closings: 132, lang: "English · Urdu" },
  { ini: "AS", name: "Ali Shah", role: "Rawalpindi & New Developments", stars: 4.7, closings: 178, lang: "English · Urdu" },
];

export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold text-ink">Meet our advisors</h1>
      <p className="mt-2 max-w-2xl text-mut">Senior, verified professionals across Pakistan’s key markets — each backed by Manzil’s legal desk.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <div key={a.name} className="flex flex-col items-center rounded-2xl border border-linesoft bg-white p-7 text-center shadow-sm">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald to-gold-deep font-serif text-2xl font-semibold text-white">{a.ini}</div>
            <h2 className="mt-4 text-lg font-extrabold text-ink">{a.name}</h2>
            <p className="text-[0.84rem] font-bold text-emerald">{a.role}</p>
            <div className="mt-2 flex items-center gap-1 text-star">
              {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} className="h-4 w-4" />)}
              <span className="ml-1 text-sm font-bold text-ink">{a.stars}</span>
              <span className="text-xs text-mut">· {a.closings} closings</span>
            </div>
            <p className="mt-1 text-xs text-mut">{a.lang}</p>
            <div className="mt-5 flex w-full gap-2">
              <a href="#" className="btn btn-wa btn-sm flex-1">WhatsApp</a>
              <a href="#" className="btn btn-ghost btn-sm flex-1">Profile</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
