"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/** Email/password login against Supabase Auth (anon key only — server-side). */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const sb = getSupabaseBrowser();
      const { error: err } = await sb.auth.signInWithPassword({ email, password });
      if (err) throw err;
      router.replace(next || "/admin");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wide text-mut">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          autoComplete="username" placeholder="admin@manzil.pk" className="input" />
      </div>
      <div>
        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wide text-mut">Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password" placeholder="••••••••" className="input" />
      </div>
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-emerald w-full disabled:opacity-60">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
