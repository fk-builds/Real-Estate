"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import { Reveal } from "@/lib/client/reveal";

/** Champagne eyebrow with hairline rule. Add `light` on dark/green panels. */
export function Kicker({ children, light }: { children: ReactNode; light?: boolean }) {
  return <span className={cx("kicker", light && "gold", "mb-2")}>{children}</span>;
}

export function SectionHead({
  eyebrow,
  title,
  desc,
  light,
  center,
  className,
  as = "div",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  desc?: ReactNode;
  light?: boolean;
  center?: boolean;
  className?: string;
  as?: "div" | "section";
}) {
  const Tag = as;
  return (
    <Reveal as={Tag} className={cx("max-w-2xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <span className={cx("inline-flex", light && "text-gold")}>
          <Kicker light={light}>{eyebrow}</Kicker>
        </span>
      )}
      <h2
        className={cx(
          "mt-3 font-display font-medium leading-[1.04] tracking-tight text-balance text-[clamp(1.9rem,4.2vw,3.1rem)]",
          light ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {desc && (
        <p className={cx("mt-4 text-[1rem] leading-relaxed", light ? "text-white/70" : "text-body")}>
          {desc}
        </p>
      )}
    </Reveal>
  );
}
