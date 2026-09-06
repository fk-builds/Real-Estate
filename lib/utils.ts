/**
 * Small, dependency-free helpers shared across server & client.
 */

/** "142400000" -> "PKR 14.5 Cr"  |  "320000" + monthly -> "PKR 320,000 /mo" */
export function formatPrice(value: number | null | undefined, opts?: { period?: string | null; unit?: string | null }): string {
  if (value == null) return "Price on request";
  const period = opts?.period === "monthly" ? " /mo" : "";
  const crore = value / 1e7; // 1 Crore = 10,000,000
  const lakh = value / 1e5; // 1 Lakh = 100,000

  const core = (() => {
    if (value >= 1e7) {
      return `${trimDecimals(crore, 1)} Cr`;
    }
    if (value >= 1e5) {
      return `${trimDecimals(lakh, 0)} Lakh`;
    }
    return value.toLocaleString("en-PK");
  })();

  return `PKR ${core}${period}`;
}

function trimDecimals(n: number, digits: number): string {
  const r = Math.round(n * 10 ** digits) / 10 ** digits;
  return r.toLocaleString("en-PK", { maximumFractionDigits: digits });
}

/** "1 Kanal" -> 8,712 sqft · "500 sq yd" etc. */
export function compactNumber(n: number): string {
  return n.toLocaleString("en-PK");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
