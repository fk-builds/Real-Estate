import type { SVGProps } from "react";
const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...p,
});
export const PinIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
export const BuildingIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 21h18M5 21V7l7-4 7 4v14" /></svg>
);
export const BedIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M2 9V6M2 13V4M2 13h9a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6" /><path d="M22 9h-3a2 2 0 0 0-2 2v4H2M22 13v2M2 19h20" /></svg>
);
export const WalletIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="2" y="7" width="20" height="12" rx="2" /><path d="M16 13h2" /></svg>
);
export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} strokeWidth={2.4}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
