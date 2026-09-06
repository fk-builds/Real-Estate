"use client";

import { useState } from "react";
import { CheckIcon, PhoneIcon, WhatsAppIcon, EmailIcon } from "@/components/ui/icons";
import { cx } from "@/lib/utils";

const METHODS = [
  { id: "call", label: "Call", icon: <PhoneIcon className="h-4 w-4" /> },
  { id: "whatsapp", label: "WhatsApp", icon: <WhatsAppIcon className="h-4 w-4" /> },
  { id: "email", label: "Email", icon: <EmailIcon className="h-4 w-4" /> },
] as const;

/**
 * Client inquiry form. Posts to /api/leads (local mode simulates success; live
 * Supabase inserts into the RLS-protected `leads` table). Fields per the
 * property page spec: Name, Phone, Email, Message + Preferred contact method.
 */
export function LeadForm({
  listingId,
  listingTitle,
  agentName,
}: {
  listingId: string;
  listingTitle: string;
  agentName?: string;
}) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<"call" | "whatsapp" | "email">("call");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          listing_title: listingTitle,
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          message: fd.get("message"),
          preferred_time: fd.get("preferred_time"),
          contact_method: method,
          agent_name: agentName,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSent(true);
      e.currentTarget.reset();
    } catch {
      setError("Something went wrong — please try again or call us directly.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-emerald/5 p-5 text-center">
        <span className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-emerald text-white">
          <CheckIcon className="h-6 w-6" />
        </span>
        <p className="font-bold text-emerald">Request received</p>
        <p className="mt-1 text-sm text-mut">
          {agentName ? `${agentName} will reach out` : "An advisor will contact you"} within 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cx("flex flex-col gap-3", sent && "hidden")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required name="name" placeholder="Full name *" className="input" />
        <input required name="phone" type="tel" placeholder="Phone / WhatsApp *" className="input" />
      </div>
      <input name="email" type="email" placeholder="Email address" className="input" />
      <select name="preferred_time" className="input">
        <option value="">Best time to call — anytime</option>
        <option>Morning</option>
        <option>Afternoon</option>
        <option>Evening</option>
        <option>This weekend</option>
      </select>
      <textarea name="message" rows={3} placeholder="Message (optional)" className="input resize-none" />

      {/* preferred contact method */}
      <fieldset>
        <legend className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-mut">
          Preferred contact method
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              aria-pressed={method === m.id}
              className={cx(
                "flex flex-col items-center gap-1 rounded-xl border-[1.5px] py-2.5 text-xs font-bold transition",
                method === m.id
                  ? "border-emerald bg-emerald/5 text-emerald"
                  : "border-line bg-white text-ink-soft hover:border-emerald/50",
              )}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={busy} className="btn btn-gold w-full">
        {busy ? "Sending…" : "Contact agent"}
      </button>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      <p className="text-center text-[0.72rem] text-mut">
        No spam — your details only go to the listing advisor.
      </p>
    </form>
  );
}
