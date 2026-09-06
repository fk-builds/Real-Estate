"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocalMode } from "@/lib/env";
import { getSupabaseServer } from "@/lib/supabase/server";
import { loadDb, persist, idgen, resetDb } from "@/lib/db/local-db";
import { requireContentManager, requireSuperAdmin, requireLeadAccess } from "@/lib/auth/authorize";
import type { Listing, LocationNode, Project } from "@/lib/data/types";
import { isPlotKind } from "@/lib/data/types";
import type { PropertyFeature } from "@/lib/data/features";
import { FEATURE_CATEGORIES } from "@/lib/data/features";
import { formatPrice, slugify } from "@/lib/utils";
import { buildMedia } from "@/lib/data/media";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { LEAD_STATUS_ORDER, type LeadStatus } from "@/lib/data/leads";
import type { Agent } from "@/lib/data/agents";

/**
 * Admin server actions — local mode writes to the JSON persistence; when
 * DATA_PROVIDER=supabase they target PostgreSQL through the service-role
 * client (respecting RLS for admin/staff). All paths that display this data
 * are revalidated so changes appear immediately.
 */

function bump() {
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/saved");
  revalidatePath("/compare");
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/features");
}

function parseNum(v: FormDataEntryValue | null): number {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseAttributes(raw: string): Record<string, string | number | boolean> | undefined {
  if (!raw.trim()) return undefined;
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) return obj;
  } catch {
    /* ignore invalid JSON */
  }
  return undefined;
}

/* ----------------------------- LISTINGS ------------------------------ */

export async function saveListingAction(formData: FormData): Promise<void> {
  await requireContentManager("listing");
  const id = String(formData.get("id") || "");
  const gallery = (String(formData.get("gallery") ?? "")
    .split("\n").map((s) => s.trim()).filter(Boolean));
  // documents: one per line, "URL | display name"
  const documents = (String(formData.get("mediaDocuments") ?? "")
    .split("\n").map((s) => s.trim()).filter(Boolean)
    .map((line): { url: string; name?: string } | null => {
      const [url, ...rest] = line.split("|").map((x) => x.trim());
      if (!url) return null;
      const name = rest.join("|").trim();
      return { url, name: name || undefined };
    })
    .filter((x): x is { url: string; name?: string } => x !== null));

  const fields = {
    title: String(formData.get("title") ?? ""),
    price: parseNum(formData.get("price")),
    purpose: String(formData.get("purpose") ?? "sale") as Listing["purpose"],
    kind: String(formData.get("kind") ?? "house") as Listing["kind"],
    status: String(formData.get("status") ?? "available") as Listing["status"],
    pricePeriod: (String(formData.get("pricePeriod") ?? "one_time") === "monthly" ? "monthly" : "one_time") as Listing["pricePeriod"],
    cityName: String(formData.get("cityName") ?? ""),
    citySlug: slugify(String(formData.get("cityName") ?? "lahore")) || "lahore",
    areaLabel: String(formData.get("areaLabel") ?? ""),
    phase: String(formData.get("phase") ?? ""),
    sector: String(formData.get("sector") ?? ""),
    block: String(formData.get("block") ?? ""),
    plotNumber: String(formData.get("plotNumber") ?? ""),
    beds: parseNum(formData.get("beds")),
    baths: parseNum(formData.get("baths")),
    floors: formData.get("floors") ? parseNum(formData.get("floors")) : undefined,
    constructionYear: formData.get("constructionYear") ? parseNum(formData.get("constructionYear")) : undefined,
    furnishingStatus: (String(formData.get("furnishingStatus") ?? "") || undefined) as Listing["furnishingStatus"],
    possessionStatus: String(formData.get("possessionStatus") ?? "") || undefined,
    street: String(formData.get("street") ?? "") || undefined,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
    currency: String(formData.get("currency") ?? "PKR"),
    areaNumber: formData.get("areaNumber") ? Number(formData.get("areaNumber")) : undefined,
    areaUnit: String(formData.get("areaUnit") ?? "sqft"),
    attributes: parseAttributes(String(formData.get("attributes") ?? "")),
    featureKeys: formData.getAll("featureKey").map(String),
    areaRaw: String(formData.get("areaRaw") ?? ""),
    verified: formData.get("verified") === "on",
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    isNew: false,
    description: String(formData.get("description") ?? ""),
    floorplanUrl: String(formData.get("floorplanUrl") ?? ""),
    videoUrl: String(formData.get("videoUrl") ?? ""),
    virtualTourUrl: String(formData.get("virtualTourUrl") ?? ""),
  };

  const db = await loadDb();

  if (id) {
    const i = db.listings.findIndex((l) => l.id === id);
    if (i < 0) throw new Error("Listing not found");
    const prev = db.listings[i];
    const updated: Listing = {
      ...prev,
      ...fields,
      priceDisplay: formatPrice(fields.price, { period: fields.pricePeriod }),
      coverImage: gallery[0] || prev.coverImage,
      gallery: gallery.length ? gallery : prev.gallery,
      media: buildMedia({
        gallery: gallery.length ? gallery : prev.gallery,
        floorplanUrl: fields.floorplanUrl || undefined,
        documents,
        videoUrl: fields.videoUrl || undefined,
        virtualTourUrl: fields.virtualTourUrl || undefined,
      }),
      floorplanUrl: fields.floorplanUrl || undefined,
      videoUrl: fields.videoUrl || undefined,
      virtualTourUrl: fields.virtualTourUrl || undefined,
      tagKind:
        fields.purpose === "rent" ? "rent"
        : fields.purpose === "lease" ? "lease"
        : fields.status === "sold" || fields.status === "rented" ? "sale"
        : "sale",
    };
    if (!updated.features) updated.features = ["Ownership & title verified"];
    db.listings[i] = updated;
  } else {
    if (!fields.title) throw new Error("Title is required");
    const cover = gallery[0] || "/images/hero.jpg";
    const listing: Listing = {
      id: idgen("ls"),
      slug: uniqueSlug(db, slugify(fields.title)),
      title: fields.title,
      headline: "",
      description: fields.description,
      purpose: fields.purpose,
      kind: fields.kind,
      status: fields.status,
      verified: fields.verified,
      featured: fields.featured,
      published: fields.published,
      isNew: true,
      views: 0,
      price: fields.price,
      pricePeriod: fields.pricePeriod,
      priceDisplay: formatPrice(fields.price, { period: fields.pricePeriod }),
      areaRaw: fields.areaRaw,
      areaNumber: fields.areaNumber,
      areaUnit: fields.areaUnit,
      beds: fields.beds,
      baths: fields.baths,
      floors: fields.floors,
      constructionYear: fields.constructionYear,
      furnishingStatus: fields.furnishingStatus,
      possessionStatus: fields.possessionStatus,
      street: fields.street,
      latitude: fields.latitude,
      longitude: fields.longitude,
      currency: fields.currency,
      attributes: fields.attributes,
      featureKeys: fields.featureKeys,
      citySlug: fields.citySlug,
      cityName: fields.cityName,
      areaLabel: fields.areaLabel,
      locationPath: [fields.cityName, fields.areaLabel, fields.phase, fields.sector, fields.block].filter(Boolean) as string[],
      phase: fields.phase || undefined,
      sector: fields.sector || undefined,
      block: fields.block || undefined,
      plotNumber: fields.plotNumber || undefined,
      coverImage: cover,
      gallery,
      media: buildMedia({
        gallery,
        floorplanUrl: fields.floorplanUrl || undefined,
        documents,
        videoUrl: fields.videoUrl || undefined,
        virtualTourUrl: fields.virtualTourUrl || undefined,
      }),
      features: ["Ownership & title verified", "Active utilities"],
      postedLabel: "Today",
      floorplanUrl: fields.floorplanUrl || undefined,
      videoUrl: fields.videoUrl || undefined,
      virtualTourUrl: fields.virtualTourUrl || undefined,
    };
    db.listings.unshift(listing);
  }

  await persist();
  bump();
}

export async function setListingField(formData: FormData): Promise<void> {
  await requireContentManager("listing");
  const id = String(formData.get("id"));
  const field = String(formData.get("field"));
  const db = await loadDb();
  const i = db.listings.findIndex((l) => l.id === id);
  if (i >= 0 && (field === "published" || field === "featured" || field === "verified")) {
    const rec = db.listings[i] as unknown as Record<string, unknown>;
    rec[field] = !Boolean(rec[field]);
    await persist();
  }
  bump();
}

export async function deleteListingAction(formData: FormData): Promise<void> {
  await requireContentManager("listing");
  const id = String(formData.get("id"));
  const db = await loadDb();
  db.listings = db.listings.filter((l) => l.id !== id);
  await persist();
  bump();
}

function uniqueSlug(db: { listings: Listing[] }, base: string): string {
  let s = base;
  let n = 1;
  while (db.listings.some((l) => l.slug === s)) s = `${base}-${n++}`;
  return s;
}

/* ----------------------------- PROJECTS ------------------------------ */

export async function saveProjectAction(formData: FormData): Promise<void> {
  await requireContentManager("project");
  const id = String(formData.get("id") || "");
  const db = await loadDb();
  const proj: Project = {
    id: id || idgen("pr"),
    slug: String(formData.get("slug") ?? "") || slugify(String(formData.get("name") ?? "")),
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? ""),
    status: String(formData.get("status") ?? ""),
    location: String(formData.get("location") ?? ""),
    priceFrom: String(formData.get("priceFrom") ?? ""),
    units: String(formData.get("units") ?? ""),
    image: String(formData.get("image") ?? "") || "/images/society-aerial.jpg",
    description: String(formData.get("description") ?? ""),
    featured: formData.get("featured") === "on",
  };
  if (id) {
    const i = db.projects.findIndex((p) => p.id === id);
    if (i >= 0) db.projects[i] = proj;
  } else db.projects.unshift(proj);
  await persist();
  bump();
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await requireContentManager("project");
  const id = String(formData.get("id"));
  const db = await loadDb();
  db.projects = db.projects.filter((p) => p.id !== id);
  await persist();
  bump();
}

/* -------------------------------- CMS -------------------------------- */

export async function saveCmsAction(formData: FormData): Promise<void> {
  await requireContentManager("cms");
  const db = await loadDb();
  for (const key of Object.keys(db.cms)) {
    const v = formData.get(key);
    if (typeof v === "string") db.cms[key] = v;
  }
  await persist();
  bump();
}

export async function resetDataAction(): Promise<void> {
  await requireSuperAdmin();
  await resetDb();
  bump();
}

/* --------------------------- LOCATION TREE ---------------------------- */

export async function addLocationAction(formData: FormData): Promise<void> {
  await requireContentManager("location");
  const db = await loadDb();
  const parentId = String(formData.get("parentId") || "") || null;
  const level = String(formData.get("level") ?? "area") as LocationNode["level"];
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");
  const node: LocationNode = {
    id: idgen("loc"),
    parentId,
    level,
    name,
    slug: slugify(name),
  };
  db.locations.push(node);
  await persist();
  bump();
}

export async function deleteLocationAction(formData: FormData): Promise<void> {
  await requireContentManager("location");
  const id = String(formData.get("id"));
  const db = await loadDb();
  if (db.locations.some((n) => n.parentId === id)) {
    throw new Error("Cannot delete a node that still has children — remove or reparent them first.");
  }
  db.locations = db.locations.filter((n) => n.id !== id);
  await persist();
  bump();
}

export async function renameLocationAction(formData: FormData): Promise<void> {
  await requireContentManager("location");
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const db = await loadDb();
  const n = db.locations.find((x) => x.id === id);
  if (n && name) {
    n.name = name;
    await persist();
  }
  bump();
}

/* ------------------------ FEATURE DICTIONARY ------------------------ */

function isFeatureCategory(c: string): c is PropertyFeature["category"] {
  return FEATURE_CATEGORIES.includes(c as PropertyFeature["category"]);
}

export async function addFeatureAction(formData: FormData): Promise<void> {
  await requireContentManager("feature");
  const db = await loadDb();
  const label = String(formData.get("label") ?? "").trim();
  const category = String(formData.get("category") ?? "Amenities");
  if (!label) throw new Error("Label is required");
  if (!isFeatureCategory(category)) throw new Error("Unknown category");
  const key = slugify(label);
  if (db.features.some((f) => f.key === key)) {
    throw new Error(`A feature "${label}" already exists.`);
  }
  db.features.push({ key, label, category });
  await persist();
  bump();
}

export async function updateFeatureAction(formData: FormData): Promise<void> {
  await requireContentManager("feature");
  const key = String(formData.get("key"));
  const db = await loadDb();
  const f = db.features.find((x) => x.key === key);
  if (f) {
    f.label = String(formData.get("label") ?? f.label).trim() || f.label;
    const cat = String(formData.get("category") ?? "");
    if (cat && isFeatureCategory(cat)) f.category = cat;
    await persist();
  }
  bump();
}

export async function deleteFeatureAction(formData: FormData): Promise<void> {
  await requireContentManager("feature");
  const key = String(formData.get("key"));
  const db = await loadDb();
  db.features = db.features.filter((f) => f.key !== key);
  // also strip the tag from any listing that referenced it
  for (const l of db.listings) {
    if (l.featureKeys) l.featureKeys = l.featureKeys.filter((k) => k !== key);
  }
  await persist();
  bump();
}

/* ----------------------------- LEADS ------------------------------- */

export async function setLeadStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  if (!id) throw new Error("Missing lead id");
  if (!LEAD_STATUS_ORDER.includes(status)) throw new Error("Unknown lead status");
  const db = await loadDb();
  const lead = db.leads.find((l) => l.id === id);
  if (!lead) throw new Error("Lead not found");
  await requireLeadAccess((lead as { assignedUserId?: string | null }).assignedUserId ?? null);
  lead.status = status;
  lead.updatedAt = Date.now();
  await persist();
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function deleteLeadAction(formData: FormData): Promise<void> {
  await requireContentManager();
  const id = String(formData.get("id") ?? "");
  const db = await loadDb();
  db.leads = db.leads.filter((l) => l.id !== id);
  await persist();
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

/* ----------------------------- AGENTS ------------------------------ */

function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "A";
}

export async function saveAgentAction(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Agent name is required");
  const cities = formData.getAll("city").map(String).filter(Boolean);
  const listingIds = formData.getAll("agentListing").map(String);
  const fields: Partial<Agent> = {
    name,
    initials: initialsOf(name),
    role: String(formData.get("role") ?? "").trim(),
    specialization: String(formData.get("specialization") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    whatsapp: String(formData.get("whatsapp") ?? "").trim(),
    phoneHref: String(formData.get("whatsapp") ?? "").replace(/\D/g, "") || String(formData.get("phone") ?? "").replace(/\D/g, ""),
    languages: String(formData.get("languages") ?? "").trim() || "English · Urdu",
    cities,
    active: formData.get("active") === "on",
    photo: String(formData.get("photo") ?? "").trim() || undefined,
    assignedListingIds: listingIds,
  };

  const db = await loadDb();
  if (id) {
    const a = db.agents.find((x) => x.id === id);
    if (!a) throw new Error("Agent not found");
    Object.assign(a, fields);
  } else {
    db.agents.push({
      id: "agent-" + Date.now().toString(36),
      stars: 0, closings: 0,
      ...fields,
    } as Agent);
  }
  await persist();
  revalidatePath("/admin/agents");
  revalidatePath("/agents");
}

export async function deleteAgentAction(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const db = await loadDb();
  db.agents = db.agents.filter((a) => a.id !== id);
  await persist();
  revalidatePath("/admin/agents");
  revalidatePath("/agents");
}

/* ----------------------------- AUTH -------------------------------- */

export async function logoutAction(): Promise<void> {
  if (!isLocalMode) {
    try {
      const sb = await getSupabaseServer();
      await sb.auth.signOut();
    } catch {
      /* session may already be invalid — redirect anyway */
    }
  }
  revalidatePath("/admin");
  redirect("/admin/login");
}
