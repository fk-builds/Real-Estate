import Link from "next/link";
import { site } from "@/lib/site";
import { LogoMark } from "./logo";
import { ArrowRightIcon } from "@/components/ui/icons";

const explore = [
  { label: "Buy a home", href: "/properties" },
  { label: "Rent a property", href: "/rent" },
  { label: "New developments", href: "/projects" },
  { label: "Plot & land", href: "/properties?kind=plot" },
  { label: "Sell with us", href: "/sell" },
];

const company = [
  { label: "About Manzil", href: "/about" },
  { label: "Our advisors", href: "/agents" },
  { label: "News & market reports", href: "/blog" },
];

export function Footer() {
  return (
    <footer className="bg-[#0c241c] text-[#bcd0c6]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.4fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="flex flex-col leading-none">
                <span className="font-serif text-[1.45rem] font-bold text-white">
                  Manzil<span className="italic text-gold-deep">.</span>
                </span>
                <span className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.24em] text-[#8aa799]">
                  منزل · premium estates
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[0.92rem] text-[#a9c1b5]">
              The premium way to buy, sell and invest in Pakistani property — backed by verified listings,
              senior advisors and airtight legal support.
            </p>
            <div className="mt-6 flex gap-2.5">
              {["f", "ig", "in", "yt"].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-[#d6e5dd] transition hover:border-gold-deep hover:bg-gold-deep hover:text-white"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 font-bold text-white">Explore</h4>
            <ul className="space-y-3">
              {explore.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[0.9rem] text-[#a9c1b5] transition hover:text-gold-2">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 font-bold text-white">Company</h4>
            <ul className="space-y-3">
              {company.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[0.9rem] text-[#a9c1b5] transition hover:text-gold-2">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="#" className="text-[0.9rem] text-[#a9c1b5] transition hover:text-gold-2">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 font-bold text-white">Get the digest</h4>
            <p className="text-[0.9rem] text-[#a9c1b5]">
              Monthly market trends, new projects and investment picks — in your inbox.
            </p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                required
                placeholder="Your email"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="grid w-12 place-items-center rounded-xl bg-gold-deep text-white transition hover:brightness-110"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </form>
            <p className="mt-5 text-[0.8rem] text-[#8aa799]">
              HQ: Blue Area, Islamabad · {site.contact.email}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-[0.8rem] text-[#8aa799]">
          <div>
            © {new Date().getFullYear()} Manzil Estates (Pvt) Ltd. All rights reserved. ·{" "}
            <a href="#" className="hover:text-gold-2">
              Privacy
            </a>{" "}
            ·{" "}
            <a href="#" className="hover:text-gold-2">
              Terms
            </a>{" "}
            ·{" "}
            <a href="#" className="hover:text-gold-2">
              Complaints
            </a>
          </div>
          <div>Member: REB (Real Estate Board) · Pakistan · English | اردو</div>
        </div>
      </div>
    </footer>
  );
}
