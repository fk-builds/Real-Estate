"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cx } from "@/lib/utils";

/**
 * Adds `.in-view` to a `.reveal` element (or `.stagger` container) the moment
 * it scrolls into the viewport. Lightweight IntersectionObserver — no deps.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Wrapper that reveals its child when scrolled into view. */
export function Reveal({
  children,
  className,
  variant = "up",
  as: Tag = "div",
  delay,
}: {
  children: ReactNode;
  className?: string;
  variant?: "up" | "left" | "right" | "zoom" | "none";
  as?: ElementType;
  delay?: string;
}) {
  const ref = useReveal<HTMLElement>();
  const base =
    variant === "left" ? "reveal reveal-left" : variant === "right" ? "reveal reveal-right"
    : variant === "zoom" ? "reveal reveal-zoom" : variant === "none" ? "reveal" : "reveal";
  return (
    <Tag ref={ref as never} className={cx(base, className)} style={delay ? { transitionDelay: delay } : undefined}>
      {children}
    </Tag>
  );
}

/** Staggered container: applies `.in-view` to trigger children fade-up one by one. */
export function Stagger({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref as never} className={cx("stagger", className)}>
      {children}
    </Tag>
  );
}
