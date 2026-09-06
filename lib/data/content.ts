import { isLocalMode } from "@/lib/env";
import { loadDb } from "@/lib/db/local-db";

/** Website content editable from the admin "Content" screen. */
export interface Cms {
  heroHeading: string;
  heroTagline: string;
  whyTitle: string;
  contactEmail: string;
  contactPhone: string;
}

export const CMS_DEFAULTS: Cms = {
  heroHeading: "Find the home that feels like yours.",
  heroTagline:
    "Manzil pairs a national marketplace with senior advisors, so you can search, compare and close on Pakistan's finest houses, plots and developments — with total confidence.",
  whyTitle: "Buy, sell & invest without the guesswork",
  contactEmail: "info@manzil.pk",
  contactPhone: "+92 300 000 0000",
};

/** Read current content (from local JSON in local mode, defaults in Supabase mode). */
export async function getCms(): Promise<Cms> {
  if (!isLocalMode) return CMS_DEFAULTS;
  const db = await loadDb();
  return { ...CMS_DEFAULTS, ...db.cms };
}
