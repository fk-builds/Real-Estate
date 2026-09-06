import { NextResponse } from "next/server";
import { getStore } from "@/lib/data/provider";

/**
 * GET /api/listings?ids=1,2,3  ->  Listing[]
 * Public read used by client pages (Saved, Compare) to hydrate listings by id.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ids = (url.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!ids.length) return NextResponse.json({ items: [] });
  const store = await getStore();
  const items = await store.getBySlugs(ids);
  return NextResponse.json({ items });
}
