// ── Types ─────────────────────────────────────────────────────────────────────

export interface CategorizedImages {
  logos: string[];
  icons: string[];
  illustrations: string[];
  backgrounds: string[];
  others: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract lowercased filename from URL, stripping query params. */
function getFilename(url: string): string {
  const path = url.toLowerCase().split("?")[0];
  return path.split("/").pop() ?? "";
}

/** Extract file extension. */
function getExtension(url: string): string {
  const filename = getFilename(url);
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop() ?? "") : "";
}

// ── Step 1: Remove Junk ───────────────────────────────────────────────────────

/**
 * Filters out base64 data URIs, blob URLs, empty/null values, and duplicates.
 * Returns a deduplicated array of clean HTTP/HTTPS URLs.
 */
function cleanImages(images: string[]): string[] {
  const seen = new Set<string>();
  return images.filter((url) => {
    if (!url) return false;
    if (url.startsWith("data:") || url.startsWith("blob:")) return false;
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

// ── Step 3: Category Rules ────────────────────────────────────────────────────

function isLogo(filename: string): boolean {
  return /\blogo\b|\bbrand\b|\bmark\b|\bwordmark\b/.test(filename);
}

function isIllustration(filename: string): boolean {
  return /\billustration\b|\bgraphic\b|\bvector\b/.test(filename);
}

function isBackground(filename: string): boolean {
  return /\bbg\b|\bbackground\b|\bhero\b|\bbanner\b|\bcover\b/.test(filename);
}

function isIcon(filename: string, ext: string): boolean {
  return ext === "svg" || /\bicon\b|\bico\b|\bglyph\b|\bsprite\b|\bbadge\b/.test(filename);
}

// ── Step 4: Main Classifier ───────────────────────────────────────────────────

/**
 * Accepts raw image URL strings and returns them grouped into five categories
 * using deterministic filename/extension heuristics. No AI, no external calls.
 */
export function classifyImages(images: string[]): CategorizedImages {
  const clean = cleanImages(images);

  const logos: string[]         = [];
  const icons: string[]         = [];
  const illustrations: string[] = [];
  const backgrounds: string[]   = [];
  const others: string[]        = [];

  for (const url of clean) {
    const filename = getFilename(url);
    const ext      = getExtension(url);

    // Priority: logos > illustrations > backgrounds > icons > others
    if (isLogo(filename)) {
      logos.push(url);
    } else if (isIllustration(filename)) {
      illustrations.push(url);
    } else if (isBackground(filename)) {
      backgrounds.push(url);
    } else if (isIcon(filename, ext)) {
      icons.push(url);
    } else {
      others.push(url);
    }
  }

  return {
    logos:         logos.slice(0, 6),
    icons:         icons.slice(0, 12),
    illustrations: illustrations.slice(0, 8),
    backgrounds:   backgrounds.slice(0, 6),
    others:        others.slice(0, 24),
  };
}
