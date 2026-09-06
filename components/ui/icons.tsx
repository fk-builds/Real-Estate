import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P): P => ({
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...p,
});

export const BedIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 9V6M2 13V4M2 13h9a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6" />
    <path d="M22 9h-3a2 2 0 0 0-2 2v4H2M22 13v2M2 19h20" />
  </svg>
);
export const BathIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h16a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2zM6 12V5a2 2 0 0 1 4 0" />
    <path d="M6 21v-3M18 21v-3" />
  </svg>
);
export const AreaIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 3l18 18M21 3 3 21" />
    <path d="M3 21v-6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v6M3 21h6M21 3h-6a3 3 0 0 0-3 3h0a3 3 0 0 0 3 3h6M21 3v6" />
  </svg>
);
export const PinIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base(p)} strokeWidth={2.4}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
export const HeartIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);
export const HeartFillIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);
export const ArrowRightIcon = (p: P) => (
  <svg {...base(p)} strokeWidth={2.4}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const ChevronLeftIcon = (p: P) => (
  <svg {...base(p)} strokeWidth={2.6}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);
export const ChevronRightIcon = (p: P) => (
  <svg {...base(p)} strokeWidth={2.6}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base(p)} strokeWidth={2.4}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const PhoneIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2z" />
  </svg>
);
export const WhatsAppIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.8 6.8 0 0 1-3.3-2.9c-.3-.4 0-.6.1-.8l.4-.5c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.8 3 .7.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.1-.2-.4-.3z" />
  </svg>
);
export const StarIcon = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 2l3 6 7 1-5 5 1 7-6-3.5L6 21l1-7-5-5 7-1z" />
  </svg>
);
export const ShieldIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z" />
  </svg>
);
export const BuildingIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 21h18M5 21V7l7-4 7 4v14" />
  </svg>
);
export const ClockIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base(p)} strokeWidth={2.4}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)} strokeWidth={2.4}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const EmailIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);
export const CarIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 16 6 8a2 2 0 0 1 2-1.8h8A2 2 0 0 1 18 8l1 8" />
    <path d="M3 16h18v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <circle cx="7.5" cy="16" r="1.3" /><circle cx="16.5" cy="16" r="1.3" />
  </svg>
);
export const LayersIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 2 9 5-9 5-9-5z" />
    <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
  </svg>
);
export const RulerIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="2" y="9" width="20" height="6" rx="1" transform="rotate(-20 12 12)" />
    <path d="m7 11.5 1 2.2M11 10l1 2.2M15 8.5l1 2.2" />
  </svg>
);
export const ExpandIcon = (p: P) => (
  <svg {...base(p)} strokeWidth={2.2}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);
export const TagIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1" />
  </svg>
);
export const GridIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
export const MapIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 3 3 5.5v15L9 18l6 3 6-2.5v-15L15 3 9 6z" />
    <path d="M9 3v15M15 6v15" />
  </svg>
);
export const DownloadIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v12M7 10l5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);


export const HomeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m3 11 9-8 9 8" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M10 21v-6h4v6" />
  </svg>
);
export const BriefcaseIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 13h20" />
  </svg>
);
export const StoreIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 9 5 3h14l2 6a2 2 0 0 1-4 1 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0 2 2 0 0 1-4 0z" />
    <path d="M5 12v9h14v-9M9 21v-6h6v6" />
  </svg>
);
export const ChevronDownIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const UserIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);
