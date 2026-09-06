import Link from "next/link";
import { notFound } from "next/navigation";
import { loadDb } from "@/lib/db/local-db";
import { AgentForm } from "@/components/admin/agent-form";
import { requireCanManageAgents } from "@/lib/auth/session";

export const metadata = { title: "Edit Agent · Admin", robots: { index: false } };

export default async function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCanManageAgents(); // only a Super Admin manages agents
  const { id } = await params;
  const db = await loadDb();
  const agent = db.agents.find((a) => a.id === id);
  if (!agent) notFound();
  const listings = [...db.listings].sort((a, b) => (b.published !== false ? 1 : 0) - (a.published !== false ? 1 : 0));
  return (
    <div>
      <div className="mb-5">
        <Link href="/admin/agents" className="text-sm font-bold text-emerald hover:underline">← Back to agents</Link>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">Edit agent — {agent.name}</h1>
      </div>
      <AgentForm agent={agent} listings={listings} />
    </div>
  );
}
