import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-28 text-center">
      <div className="text-6xl">🏡</div>
      <h1 className="mt-6 font-serif text-4xl font-semibold text-ink">This page moved out</h1>
      <p className="mt-3 text-mut">
        The page you&rsquo;re looking for isn&rsquo;t available. Search the marketplace instead.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn btn-emerald">Back home</Link>
        <Link href="/properties" className="btn btn-ghost">Browse properties</Link>
      </div>
    </div>
  );
}
