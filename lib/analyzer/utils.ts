// ── Shared color utilities ───────────────────────────────────────────────────

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-1
  l: number; // 0-1
}

/** Parse any CSS color string to an #RRGGBB hex. Returns null for invalid/transparent. */
export function parseColorToHex(color: string): string | null {
  if (!color) return null;
  const raw = color.trim().toLowerCase();

  if (
    raw === "transparent" ||
    raw === "none" ||
    raw === "inherit" ||
    raw === "initial" ||
    raw === "currentcolor" ||
    raw === "unset"
  ) {
    return null;
  }

  // Full hex  #RRGGBB
  {
    const m = raw.match(/^#([0-9a-f]{6})$/);
    if (m) return "#" + m[1].toUpperCase();
  }

  // Short hex  #RGB
  {
    const m = raw.match(/^#([0-9a-f]{3})$/);
    if (m) {
      const [a, b, c] = m[1].split("");
      return "#" + (a + a + b + b + c + c).toUpperCase();
    }
  }

  // rgb(r, g, b)  or  rgb(r g b)
  {
    const m = raw.match(/^rgb\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*\)$/);
    if (m) return rgbToHex({ r: +m[1], g: +m[2], b: +m[3] });
  }

  // rgba(r, g, b, a)  — discard near-transparent
  {
    const m = raw.match(
      /^rgba\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)[,\s\/]+([\d.]+)\s*\)$/
    );
    if (m) {
      if (parseFloat(m[4]) < 0.08) return null;
      return rgbToHex({ r: +m[1], g: +m[2], b: +m[3] });
    }
  }

  return null;
}

export function hexToRGB(hex: string): RGB | null {
  const m = hex.replace("#", "").match(/^([0-9a-fA-F]{6})$/);
  if (!m) return null;
  return {
    r: parseInt(m[1].slice(0, 2), 16),
    g: parseInt(m[1].slice(2, 4), 16),
    b: parseInt(m[1].slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [r, g, b]
      .map((v) => clamp(v).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/** Euclidean distance in RGB space. Max ≈ 441 (black→white). */
export function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2
  );
}

export function rgbToHSL({ r, g, b }: RGB): HSL {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;

  return { h: h * 360, s, l };
}

/**
 * Perceived relative luminance (WCAG formula).
 * 0 = black, 1 = white.
 */
export function relativeLuminance({ r, g, b }: RGB): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Mean centroid of an array of RGB values. */
export function computeCentroid(colors: RGB[]): RGB {
  if (!colors.length) return { r: 0, g: 0, b: 0 };
  const n = colors.length;
  return {
    r: colors.reduce((s, c) => s + c.r, 0) / n,
    g: colors.reduce((s, c) => s + c.g, 0) / n,
    b: colors.reduce((s, c) => s + c.b, 0) / n,
  };
}
