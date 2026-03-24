import type { FontSystem } from "../types";

// ── Lists of fonts to exclude ─────────────────────────────────────────────────

const GENERIC_FAMILIES = new Set([
  "serif", "sans-serif", "monospace", "cursive", "fantasy",
  "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded",
  "math", "emoji", "fangsong",
]);

const SYSTEM_FONTS = new Set([
  // Apple
  "-apple-system", "blinkmacsystemfont",
  // Microsoft
  "segoe ui", "ms sans serif", "ms serif",
  // Common OS fallbacks
  "arial", "helvetica", "helvetica neue",
  "times", "times new roman",
  "courier", "courier new",
  "verdana", "georgia", "palatino", "palatino linotype",
  "garamond", "bookman old style",
  "comic sans ms", "trebuchet ms", "impact",
  "lucida", "lucida sans", "lucida sans unicode", "lucida console",
  "tahoma", "geneva", "optima",
  // Emoji / symbol
  "apple color emoji", "segoe ui emoji", "segoe ui symbol",
  "noto color emoji", "noto sans", "noto serif",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function cleanFontName(raw: string): string {
  return raw.trim().replace(/['"]/g, "").trim();
}

function isSignificant(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    name.length > 1 &&
    !GENERIC_FAMILIES.has(lower) &&
    !SYSTEM_FONTS.has(lower)
  );
}

// ── Main analyzer ─────────────────────────────────────────────────────────────

/**
 * Accepts a frequency map of raw CSS font-family strings and returns a
 * structured FontSystem with primary/secondary/all.
 *
 * @param fontFreq  Map<cssFontFamilyString, occurrenceCount>
 */
export function analyzeFonts(fontFreq: Map<string, number>): FontSystem {
  // Aggregate count per cleaned, significant font name.
  // A raw font-family value like "Inter, sans-serif" contributes to "Inter".
  const nameCount = new Map<string, number>();

  for (const [raw, count] of fontFreq) {
    // Font-family strings can be comma-separated lists
    const parts = raw.split(",");
    for (const part of parts) {
      const name = cleanFontName(part);
      if (isSignificant(name)) {
        nameCount.set(name, (nameCount.get(name) ?? 0) + count);
      }
    }
  }

  // Sort by frequency descending
  const sorted = Array.from(nameCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  const primary   = sorted[0] ?? "System UI";
  const secondary = sorted[1] ?? sorted[0] ?? "System UI";

  return {
    primary,
    secondary,
    all: sorted.slice(0, 12),
  };
}
