import type { Listing } from "./types";

/**
 * Advisors ("agents") that handle listings. Lightweight, data-driven module.
 * The detail page shows the advisor who verified a listing, their contact
 * methods and other active listings. A real system stores these rows in an
 * `agents` table and links `listings.agent_id`; here they are derived by city
 * (see listingAgent) so the UI is fully functional in local dev too.
 */
export interface Agent {
  id: string;
  name: string;
  role: string;
  /** initials monogram / avatar fallback */
  initials: string;
  /** optional portrait image path (falls back to initials) */
  photo?: string;
  stars: number;
  closings: number;
  /** display phone */
  phone: string;
  /** href-safe phone (tel:) */
  phoneHref: string;
  /** whatsapp number incl. country code, no + */
  whatsapp: string;
  email: string;
  languages: string;
  /** which city slugs this advisor serves (for listing -> agent lookup) */
  cities: string[];
  /** --- management fields (admin-editable, optional in local seeds) --- */
  bio?: string;
  /** area of expertise, e.g. "DHA Lahore plots & homes" */
  specialization?: string;
  /** whether the advisor is active on the site */
  active?: boolean;
  /** property ids currently assigned to this agent (management) */
  assignedListingIds?: string[];
}

export const ADVISORS: Agent[] = [
  {
    id: "ar", name: "Ayesha Raza", role: "Senior Advisor · Islamabad & Lahore",
    initials: "AR", stars: 4.9, closings: 148,
    phone: "+92 300 000 0000", phoneHref: "+923000000000", whatsapp: "923000000000",
    email: "ayesha@manzil.pk", languages: "English · Urdu", cities: ["islamabad", "lahore"],
  },
  {
    id: "bk", name: "Bilal Khan", role: "Head of Legal & Due Diligence",
    initials: "BK", stars: 4.9, closings: 320,
    phone: "+92 300 111 0000", phoneHref: "+923001110000", whatsapp: "923001110000",
    email: "bilal@manzil.pk", languages: "English · Urdu · Punjabi", cities: [],
  },
  {
    id: "hk", name: "Hina Khalid", role: "Karachi Region Lead",
    initials: "HK", stars: 4.8, closings: 132,
    phone: "+92 300 222 0000", phoneHref: "+923002220000", whatsapp: "923002220000",
    email: "hina@manzil.pk", languages: "English · Urdu", cities: ["karachi"],
  },
  {
    id: "om", name: "Omar Mehmood", role: "Commercial & Investment Advisor",
    initials: "OM", stars: 4.9, closings: 210,
    phone: "+92 300 333 0000", phoneHref: "+923003330000", whatsapp: "923003330000",
    email: "omar@manzil.pk", languages: "English · Urdu", cities: ["rawalpindi", "peshawar"],
  },
  {
    id: "as", name: "Ali Shah", role: "Rawalpindi & New Developments",
    initials: "AS", stars: 4.7, closings: 178,
    phone: "+92 300 444 0000", phoneHref: "+923004440000", whatsapp: "923004440000",
    email: "ali@manzil.pk", languages: "English · Urdu", cities: ["rawalpindi"],
  },
  {
    id: "sf", name: "Sara Farooq", role: "Overseas Sales · UK / UAE desk",
    initials: "SF", stars: 4.8, closings: 96,
    phone: "+92 300 555 0000", phoneHref: "+923005550000", whatsapp: "923005550000",
    email: "sara@manzil.pk", languages: "English · Urdu", cities: [],
  },
];

const AGENT_BY_ID = new Map(ADVISORS.map((a) => [a.id, a]));

export function agentById(id?: string): Agent | undefined {
  return id ? AGENT_BY_ID.get(id) : undefined;
}

/** The advisor that handles a listing — by city when known, else the default. */
export function listingAgent(listing: Pick<Listing, "citySlug">): Agent {
  return ADVISORS.find((a) => a.cities.includes(listing.citySlug)) ?? ADVISORS[0];
}

/** Number-only phone for the `phone_href` / `href="tel:"`. */
export function phoneHref(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

/** Build a wa.me deep link with a prefilled message. */
export function whatsappLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
