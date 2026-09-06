"use client";

import { useCollection } from "@/lib/client/collections";
import { cx } from "@/lib/utils";

/** Circular + / ✓ toggle that adds a listing to the compare basket (max 4). */
export function CompareButton({ listingId }: { listingId: string }) {
  const compare = useCollection("compare", 4);
  const active = compare.has(listingId);

  return (
    <button
      onClick={() => compare.toggle(listingId)}
      aria-pressed={active}
      title={active ? "Remove from compare" : "Add to compare"}
      className={cx(
        "absolute bottom-3 right-3 z-[2] grid h-9 w-9 place-items-center rounded-full border text-sm font-black shadow-sm backdrop-blur transition",
        active
          ? "border-gold-deep bg-gold-deep text-white"
          : "border-white/60 bg-white/85 text-ink hover:border-gold-deep hover:text-gold-deep",
      )}
    >
      {active ? "✓" : "+"}
    </button>
  );
}
