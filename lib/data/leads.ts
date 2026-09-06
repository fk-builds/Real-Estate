/** LEAD model + lifecycle, used by the enquiry form and the admin dashboard. */

export type LeadStatus = "new" | "contacted" | "follow_up" | "converted" | "closed";

export interface Lead {
  id: string;
  /** property the enquiry is about (nullable when a general enquiry) */
  listingId?: string;
  listingSlug?: string;
  listingTitle?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  /** channel / origin of the lead: web form, whatsapp, call, referral, social */
  source: string;
  agentId?: string;
  agentName?: string;
  status: LeadStatus;
  /** epoch ms when the lead was created */
  createdAt: number;
  updatedAt?: number;
}

export const LEAD_STATUS_ORDER: LeadStatus[] = ["new", "contacted", "follow_up", "converted", "closed"];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-up",
  converted: "Converted",
  closed: "Closed",
};

/** Tailwind badge styling per status. */
export const LEAD_STATUS_CLASS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  follow_up: "bg-purple-100 text-purple-700",
  converted: "bg-emerald-100 text-emerald-700",
  closed: "bg-stone-200 text-stone-600",
};

export const LEAD_SOURCES = ["web", "whatsapp", "call", "referral", "social", "agent", "walk_in"];

/** A handful of realistic demo leads so the dashboard/table isn't empty. */
export function sampleLeads(): Lead[] {
  const now = Date.now();
  const day = 86_400_000;
  return [
    {
      id: "lead-demo-1", name: "Usman Tariq", phone: "+92 321 555 0101", email: "usman.t@example.com",
      listingId: "10", listingSlug: "modern-5-marla-house-dha-phase-6-lahore", listingTitle: "5 Marla Modern House, DHA Phase 6",
      message: "Is the DHA Phase 6 house still available? Can I see it this weekend?",
      source: "web", status: "new", createdAt: now - 3 * day, updatedAt: now - 3 * day,
    },
    {
      id: "lead-demo-2", name: "Maria Qureshi", phone: "+92 300 555 0202", email: "maria.q@example.com",
      listingId: "11", listingSlug: "5-marla-residential-plot-dha-phase-6-lahore", listingTitle: "5 Marla Residential Plot, DHA Phase 6",
      message: "Interested in the corner plot. What is the total with transfer?",
      source: "whatsapp", status: "contacted", createdAt: now - 5 * day, updatedAt: now - 2 * day,
    },
    {
      id: "lead-demo-3", name: "Ahmed Rizvi", phone: "+92 333 555 0303",
      email: "a.rizvi@example.com", listingId: "3", listingSlug: "boutique-stone-glass-villa-gulberg-greens",
      listingTitle: "Boutique Stone & Glass Villa, Gulberg Greens",
      message: "Could you arrange a virtual tour for the Gulberg villa?",
      source: "referral", status: "follow_up", createdAt: now - 8 * day, updatedAt: now - 1 * day,
    },
    {
      id: "lead-demo-4", name: "Fatima Noor", phone: "+92 311 555 0404", email: "fatima.noor@example.com",
      listingId: "1", listingSlug: "modern-luxury-villa-dha-phase-8-lahore", listingTitle: "1 Kanal Modern Luxury Villa, DHA Phase 8",
      message: "We would like to book an on-site visit on Saturday.",
      source: "social", status: "converted", createdAt: now - 12 * day, updatedAt: now - 4 * day,
    },
    {
      id: "lead-demo-5", name: "Kamran Saeed", phone: "+92 345 555 0505", email: "kamran.s@example.com",
      message: "Looking for a 10 marla plot in Rawalpindi under 4 crore. Please reach out.",
      source: "call", status: "new", createdAt: now - 1 * day, updatedAt: now - 1 * day,
    },
  ];
}
