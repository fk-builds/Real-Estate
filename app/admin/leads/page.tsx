import Link from "next/link";
import { loadDb } from "@/lib/db/local-db";
import { getAdminSession } from "@/lib/auth/session";
import { deleteLeadAction, setLeadStatusAction } from "../actions";
import {
  LEAD_STATUS_CLASS, LEAD_STATUS_LABEL, LEAD_STATUS_ORDER, type Lead, type LeadStatus,
} from "@/lib/data/leads";

export const metadata = { title: "Leads · Admin", robots: { index: false } };

export default async function LeadsAdminPage() {
  const session = await getAdminSession();
  const db = await loadDb();
  // Server-side read scoping: agents only ever receive leads assigned to them
  // (mirrors the "leads: read by role" RLS policy). Admins see everything.
  let rows = db.leads;
  if (session?.role === "agent" && session.userId) {
    rows = rows.filter((l) => (l as unknown as { assignedUserId?: string }).assignedUserId === session.userId);
  }
  const scoped = session?.role === "agent";
  const leads = [...rows].sort((a, b) => b.createdAt - a.createdAt);
  const counts = (s: LeadStatus) => leads.filter((l) => l.status === s).length;

  const summary = [
    { label: "New", value: counts("new"), cls: "text-blue-600" },
    { label: "Contacted", value: counts("contacted"), cls: "text-amber-600" },
    { label: "Follow-up", value: counts("follow_up"), cls: "text-purple-600" },
    { label: "Converted", value: counts("converted"), cls: "text-emerald-600" },
    { label: "Closed", value: counts("closed"), cls: "text-stone-500" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-ink">Leads</h1>
      <p className="mt-1 text-mut">Enquiries from the public — triage, contact and track to close.</p>
      {scoped && <p className="mt-1 text-xs font-semibold text-emerald">Agent view — showing only your assigned leads.</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl border border-linesoft bg-white p-5 shadow-sm">
            <div className={`font-serif text-3xl font-bold ${s.cls}`}>{s.value}</div>
            <div className="mt-1 text-sm font-semibold text-ink-soft">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-linesoft bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="font-serif text-lg font-semibold text-ink">All enquiries · {leads.length}</div>
        </div>
        {leads.length === 0 ? (
          <p className="p-10 text-center text-mut">No leads yet. Enquiries from the site will appear here.</p>
        ) : (
          <div className="divide-y divide-line">
            {leads.map((l) => <LeadRow key={l.id} lead={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function LeadRow({ lead }: { lead: Lead }) {
  const detail = lead.listingSlug ? (
    <Link href={`/property/${lead.listingSlug}`} className="text-emerald hover:underline">{lead.listingTitle ?? "Property"}</Link>
  ) : (lead.listingTitle ?? "General enquiry");

  return (
    <div className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-ink">{lead.name}</span>
          <span className={`badge ${LEAD_STATUS_CLASS[lead.status]}`}>{LEAD_STATUS_LABEL[lead.status]}</span>
        </div>
        <div className="mt-1 text-xs text-mut">{fmtDate(lead.createdAt)} · via {lead.source}</div>
        <div className="mt-1.5 text-sm text-body">{detail}</div>
        {lead.message && <div className="mt-1 line-clamp-2 text-sm text-mut">“{lead.message}”</div>}
      </div>

      <div className="text-sm">
        <div className="font-semibold text-ink-soft">{lead.phone}</div>
        {lead.email && <div className="truncate text-mut">{lead.email}</div>}
        {lead.agentName && <div className="text-xs text-mut">Assigned: {lead.agentName}</div>}
      </div>

      <form action={setLeadStatusAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={lead.id} />
        <select name="status" defaultValue={lead.status} className="input !py-1.5 text-sm">
          {LEAD_STATUS_ORDER.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>)}
        </select>
        <button className="rounded-lg bg-emerald px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-2">Set</button>
      </form>

      <form action={deleteLeadAction}>
        <input type="hidden" name="id" value={lead.id} />
        <button className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">
          Delete
        </button>
      </form>
    </div>
  );
}
