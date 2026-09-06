"use client";

import Link from "next/link";
import { useCollection } from "@/lib/client/collections";
import { CloseIcon } from "@/components/ui/icons";

/** Floating "Compare" bar shown once 2+ properties are selected. */
export function CompareTray() {
  const compare = useCollection("compare", 4);
  const count = compare.items.length;
  if (count < 2) return null;

  const href = `/compare?ids=${compare.items.join(",")}`;
  return (
    <div className="fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-gold/40 bg-emerald-2 py-2 pl-5 pr-2 text-white shadow-2xl">
        <span className="text-sm font-bold">
          Compare <span className="text-gold-2">{count}</span> {count === 1 ? "property" : "properties"}
        </span>
        <Link href={href} className="rounded-full bg-gold-deep px-4 py-2 text-sm font-extrabold transition hover:brightness-110">
          Compare now →
        </Link>
        <button
          onClick={compare.clear}
          aria-label="Clear compare"
          className="grid h-8 w-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
