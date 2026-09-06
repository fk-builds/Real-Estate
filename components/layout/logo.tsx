import Link from "next/link";
import { cx } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cx("h-11 w-11 rounded-xl", className)}>
      <defs>
        <linearGradient id="lgmark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a4234" />
          <stop offset="1" stopColor="#126d57" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#lgmark)" />
      <path d="M10 36 24 14l14 22h-6.4L24 25.4 16.4 36z" fill="#fff" />
      <rect x="10" y="36" width="28" height="3.4" rx="1.7" fill="#d9ba72" />
    </svg>
  );
}

export function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={cx("flex items-center gap-2.5", className)} aria-label="Manzil home">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cx(
            "text-[1.45rem] font-extrabold leading-none tracking-tight",
            light ? "text-white" : "text-ink",
          )}
        >
          Manzil<span className={cx("font-normal", light ? "text-emerald-3" : "text-emerald")}>.</span>
        </span>
        <span className={cx("mt-1 text-[0.62rem] font-bold uppercase tracking-[0.2em]", light ? "text-[#9fb8ad]" : "text-mut")}>
          Real Estate · Pakistan
        </span>
      </span>
    </Link>
  );
}
