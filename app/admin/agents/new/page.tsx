import Link from "next/link";
import { loadDb } from "@/lib/db/local-db";
import { AgentForm } from "@/components/admin/agent-form";
import { requireCanManageAgents } from "@/lib/auth/session";

export const metadata = { title: "New Agent · Admin", robots: { index: false } };

export default async function NewAgentPage() {
  await requireCanManageAgents(); // only a Super Admin manages agents
  const db = await loadDb();
  const listings = [...db.listings].sort((a, b) => (b.published !== false ? 1 : 0) - (a.published !== false ? 1 : 0));
  return (
    <div>
      <div className="mb-5">
        <Link href="/admin/agents" className="text-sm font-bold text-emerald hover:underline">← Back to agents</Link>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">Add agent</h1>
      </div>
      <AgentForm listings={listings} />
    </div>
  );
}
