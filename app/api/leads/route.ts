import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocalMode } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { loadDb, persist } from "@/lib/db/local-db";

const leadSchema = z.object({
  listing_id: z.string().optional(),
  listing_title: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Valid phone required"),
  email: z.string().email().optional().or(z.literal("")),
  preferred_time: z.string().optional(),
  message: z.string().optional(),
  agent_id: z.string().uuid().optional(),
  contact_method: z.enum(["call", "whatsapp", "email"]).optional(),
  agent_name: z.string().optional(),
});

export const runtime = "nodejs";

/** POST /api/leads — persist a property enquiry. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  if (isLocalMode) {
    // Local mode persists to the JSON store so the admin Lead Management
    // dashboard reflects real enquiries (mirrors the Supabase `leads` insert).
    const id = "lead-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    const db = await loadDb();
    db.leads.push({
      id,
      listingId: d.listing_id ? String(d.listing_id) : undefined,
      listingTitle: d.listing_title,
      name: d.name,
      phone: d.phone,
      email: d.email || undefined,
      message: d.message,
      source: "web",
      agentId: d.agent_id,
      agentName: d.agent_name,
      status: "new",
      createdAt: Date.now(),
    });
    await persist();
    console.log("[lead:local]", { ...d, id });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  }

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: "Server not configured for leads" }, { status: 500 });
  }

  const { error } = await db.from("leads").insert({
    listing_id: d.listing_id ? Number(d.listing_id) : null,
    agent_id: d.agent_id ?? null,
    name: d.name,
    phone: d.phone,
    email: d.email || null,
    message: d.message ?? null,
    preferred_time: d.preferred_time ?? null,
    channel: "web",
  });

  if (error) {
    console.error("lead insert failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
