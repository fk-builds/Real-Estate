import Link from "next/link";
import { adminAuthEnabled } from "@/lib/auth/session";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Sign in · Admin", robots: { index: false, nofollow: true } };

type Raw = { next?: string };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<Raw> }) {
  const sp = await searchParams;
  const next = sp.next;

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 block text-center font-serif text-2xl font-semibold text-ink">
          Manzil <span className="text-emerald">Admin</span>
        </Link>

        <div className="rounded-2xl border border-linesoft bg-white p-7 shadow-sm">
          {!adminAuthEnabled ? (
            <>
              <h1 className="font-serif text-xl font-semibold text-ink">Authentication not configured</h1>
              <p className="mt-2 text-sm text-mut">
                You&rsquo;re running in <b>local demo mode</b> without Supabase Auth, so the admin panel is open
                (no sign-in required).
              </p>
              <p className="mt-3 rounded-xl bg-cream p-3 text-xs text-mut">
                To enable login, add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> +{" "}
                <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and run the{" "}
                <code className="font-mono">supabase/sql/auth.sql</code> schema (see .env.example).
              </p>
              <Link href="/admin" className="btn btn-emerald mt-5 w-full">Open the admin panel →</Link>
            </>
          ) : (
            <>
              <h1 className="font-serif text-xl font-semibold text-ink">Welcome back</h1>
              <p className="mt-1 mb-5 text-sm text-mut">Sign in with your admin account to continue.</p>
              <LoginForm next={next} />
              {next && <p className="mt-3 text-center text-xs text-mut">You&rsquo;ll be returned to the page you requested.</p>}
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-mut">
          Protected by Supabase Auth · roles: Super Admin / Admin / Agent
        </p>
      </div>
    </div>
  );
}
