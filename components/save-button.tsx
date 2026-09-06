"use client";

import { HeartIcon, HeartFillIcon } from "@/components/ui/icons";
import { cx } from "@/lib/utils";
import { useCollection } from "@/lib/client/collections";

/**
 * Save/favourite heart, persisted in the guest saved-basket (localStorage).
 * When a real account is connected this maps to saved_properties via Supabase;
 * the UI contract stays the same.
 */
export function SaveButton({ listingId, className }: { listingId: string; className?: string }) {
  const saved = useCollection("saved");
  const on = saved.has(listingId);

  return (
    <button
      aria-label={on ? "Remove from saved" : "Save property"}
      onClick={(e) => {
        e.preventDefault();
        saved.toggle(listingId);
      }}
      className={cx(
        "absolute right-3 top-3 z-[2] grid h-9 w-9 place-items-center rounded-xl bg-white/95 text-ink shadow-sm backdrop-blur transition",
        on && "text-red-600",
        className,
      )}
    >
      {on ? <HeartFillIcon className="h-[19px] w-[19px]" /> : <HeartIcon className="h-[19px] w-[19px]" />}
    </button>
  );
}
