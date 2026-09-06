/**
 * Site-wide brand + marketing configuration. Single source of truth used by
 * the navbar, footer, metadata and structured data.
 */
export const site = {
  name: "Manzil",
  tagline: "Premium Estates",
  urdu: "منزل",
  description:
    "The premium way to buy, sell and invest in Pakistani property — verified listings, senior advisors and airtight legal support.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  cities: ["Islamabad", "Lahore", "Karachi", "Rawalpindi", "Peshawar", "Faisalabad"],
  contact: { phone: "+92 300 000 0000", email: "info@manzil.pk" },
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
  },
} as const;

export const purposeLabels = { sale: "For Sale", rent: "For Rent", lease: "For Lease" } as const;
export const purposeLabel = (p?: string) =>
  purposeLabels[p as keyof typeof purposeLabels] ?? "Property";

/** Full ordered property-type catalogue (keys mirror PropertyKind). */
export const kindLabels: Record<string, string> = {
  "residential-plot": "Residential Plot",
  "commercial-plot": "Commercial Plot",
  house: "House",
  villa: "Villa",
  apartment: "Apartment",
  flat: "Flat",
  penthouse: "Penthouse",
  office: "Office",
  shop: "Shop",
  plaza: "Plaza",
  farmhouse: "Farmhouse",
  "agricultural-land": "Agricultural Land",
  warehouse: "Warehouse",
  building: "Building",
  industrial: "Industrial Property",
  other: "Other",
};

export interface KindGroup {
  label: string;
  kinds: Array<{ key: string; label: string }>;
}
/** Kind catalogue grouped for filter UIs. */
export const KIND_GROUPS: KindGroup[] = [
  {
    label: "Plots & Land",
    kinds: [
      { key: "residential-plot", label: "Residential Plot" },
      { key: "commercial-plot", label: "Commercial Plot" },
      { key: "agricultural-land", label: "Agricultural Land" },
      { key: "farmhouse", label: "Farmhouse" },
    ],
  },
  {
    label: "Residential",
    kinds: [
      { key: "house", label: "House" },
      { key: "villa", label: "Villa" },
      { key: "apartment", label: "Apartment" },
      { key: "flat", label: "Flat" },
      { key: "penthouse", label: "Penthouse" },
    ],
  },
  {
    label: "Commercial",
    kinds: [
      { key: "office", label: "Office" },
      { key: "shop", label: "Shop" },
      { key: "plaza", label: "Plaza" },
      { key: "building", label: "Building" },
      { key: "warehouse", label: "Warehouse" },
      { key: "industrial", label: "Industrial" },
    ],
  },
  { label: "Other", kinds: [{ key: "other", label: "Other" }] },
];

/** status label helper */
export const statusLabel = (s?: string) =>
  (({ available: "Available", sold: "Sold", rented: "Rented", reserved: "Reserved", under_offer: "Under Offer", pending_verification: "Pending Verification", draft: "Draft" }) as Record<string, string>)[s ?? ""] ?? "";

/** All property-type keys (for validation / select options). */
export const PROPERTY_KIND_KEYS = Object.keys(kindLabels);
