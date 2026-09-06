"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/ui/icons";

/** Copies the current listing URL or triggers the native share sheet. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user dismissed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  }

  return (
    <button onClick={onShare} className="btn btn-ghost w-full">
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4" /> Link copied
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
            <path d="M16 6l-4-4-4 4M12 2v13" />
          </svg>
          Share this property
        </>
      )}
    </button>
  );
}
