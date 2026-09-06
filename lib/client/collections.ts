"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Lightweight cross-component store persisted to localStorage. Powers guest
 * "saved/favourite" and "compare" baskets without a backend. Components stay
 * in sync via a tiny pub/sub.
 */
const STORE = {
  saved: [] as string[],
  compare: [] as string[],
};
const listeners = new Set<() => void>();

function broadcast() {
  listeners.forEach((l) => l());
}
function emit(name: keyof typeof STORE) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(`manzil:${name}`);
  STORE[name] = raw ? (JSON.parse(raw) as string[]) : [];
  broadcast();
}
function persist(name: keyof typeof STORE) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`manzil:${name}`, JSON.stringify(STORE[name]));
  broadcast();
}
function initAll() {
  (Object.keys(STORE) as Array<keyof typeof STORE>).forEach(emit);
}

export type CollectionName = "saved" | "compare";

export function useCollection(name: CollectionName, max = Infinity) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    emit(name);
    setItems([...STORE[name]]);
    const fn = () => setItems([...STORE[name]]);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, [name]);

  const toggle = useCallback(
    (id: string) => {
      const i = STORE[name].indexOf(id);
      if (i >= 0) STORE[name].splice(i, 1);
      else if (STORE[name].length < max) STORE[name].push(id);
      persist(name);
      setItems([...STORE[name]]);
    },
    [name, max],
  );

  const remove = useCallback(
    (id: string) => {
      STORE[name] = STORE[name].filter((x) => x !== id);
      persist(name);
      setItems([...STORE[name]]);
    },
    [name],
  );

  const clear = useCallback(() => {
    STORE[name] = [];
    persist(name);
    setItems([]);
  }, [name]);

  return { items, has: items.includes.bind(items), toggle, remove, clear };
}

if (typeof window !== "undefined") initAll();
