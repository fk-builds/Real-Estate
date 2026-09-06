"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeftIcon, ChevronRightIcon, ExpandIcon, CloseIcon, GridIcon,
} from "@/components/ui/icons";
import type { MediaItem } from "@/lib/data/types";
import { cx } from "@/lib/utils";

/**
 * Photo gallery — renders a property's ordered `MediaItem[]` photos.
 * Optimization: Next.js <Image> with `fill` inside a fixed-aspect container +
 * explicit `sizes`, `priority` only for the first frame (everything else is
 * lazy), and the optimizer emits AVIF/WebP automatically. Captions and alt
 * text come from each media item (never hard-coded). Supports a full-screen
 * lightbox over all photos.
 */
export function Gallery({ items, title }: { items: MediaItem[]; title: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const list = items.length ? items : [];
  const count = list.length;

  const go = useCallback((a: number) => setActive(((a % count) + count) % count), [count]);
  const next = useCallback(() => go(active + 1), [go, active]);
  const prev = useCallback(() => go(active - 1), [go, active]);

  // scroll lock while the lightbox is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // keyboard nav (main view + lightbox)
  useEffect(() => {
    if (count <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, next, prev]);

  if (!count) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-3xl border border-linesoft bg-cream text-mut">
        No photos available.
      </div>
    );
  }

  const current = list[Math.min(active, count - 1)];

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-linesoft bg-white shadow-md">
        <div className="group relative aspect-[16/10] bg-[#111]">
          <Image
            key={current.url}
            src={current.url}
            alt={current.alt ?? `${title} — ${current.caption ?? `photo ${active + 1}`}`}
            fill
            priority={active === 0}
            sizes="(max-width:1024px) 100vw, 60vw"
            className="object-cover"
          />
          {/* expand / fullscreen */}
          <button onClick={() => setOpen(true)} aria-label="Open full-screen gallery"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white">
            <ExpandIcon className="h-4 w-4" />
          </button>
          {count > 1 && (
            <>
              <button onClick={prev} aria-label="Previous photo"
                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg transition hover:bg-white">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button onClick={next} aria-label="Next photo"
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg transition hover:bg-white">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </>
          )}
          <span className="absolute bottom-4 right-4 rounded-full bg-emerald-2/80 px-3 py-1 text-xs font-bold text-white backdrop-blur">
            {active + 1} / {count}
          </span>
          {/* caption */}
          {current.caption && (
            <figcaption className="pointer-events-none absolute bottom-4 left-4 right-16 rounded-xl bg-black/45 px-3 py-1.5 text-sm font-medium text-white backdrop-blur">
              {current.caption}
            </figcaption>
          )}
        </div>

        {count > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto bg-white p-3">
            {list.map((item, i) => (
              <button key={item.url + i} onClick={() => setActive(i)}
                title={item.caption ?? item.alt}
                aria-label={item.caption ?? `photo ${i + 1}`}
                className="relative flex-none overflow-hidden rounded-xl">
                <Image
                  src={item.url}
                  alt=""
                  width={104}
                  height={70}
                  sizes="104px"
                  className={cx(
                    "h-[70px] w-[104px] rounded-xl object-cover transition",
                    i === active ? "ring-2 ring-gold-deep opacity-100" : "opacity-60 hover:opacity-100",
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* full-screen lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[120] flex flex-col bg-black/95 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen gallery"
        >
          <div className="flex items-center justify-between px-5 py-3 text-white">
            <span className="flex items-center gap-2 text-sm font-semibold opacity-90">
              <GridIcon className="h-4 w-4" /> {active + 1} / {count}
            </span>
            <button onClick={() => setOpen(false)} aria-label="Close gallery"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white/10">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image
              key={current.url}
              src={current.url}
              alt={current.alt ?? `${title} — photo ${active + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {count > 1 && (
              <>
                <button onClick={prev} aria-label="Previous photo"
                  className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                  <ChevronLeftIcon className="h-7 w-7" />
                </button>
                <button onClick={next} aria-label="Next photo"
                  className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                  <ChevronRightIcon className="h-7 w-7" />
                </button>
              </>
            )}
          </div>
          <div className="flex min-h-[64px] items-center gap-4 overflow-x-auto px-5 py-3">
            {list.map((item, i) => (
              <button key={item.url + "lb" + i} onClick={() => setActive(i)}
                className={cx("h-12 w-[88px] flex-none overflow-hidden rounded-lg ring-offset-2 ring-offset-black",
                  i === active ? "ring-2 ring-gold-deep" : "opacity-50 hover:opacity-90")}>
                <Image src={item.url} alt="" width={88} height={48} sizes="88px" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          {current.caption && (
            <p className="border-t border-white/10 px-5 py-3 text-center text-sm text-white/85">{current.caption}</p>
          )}
        </div>
      )}
    </>
  );
}
