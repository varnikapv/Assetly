import type { ColorSystem } from "../types";
import {
  RGB,
  parseColorToHex,
  hexToRGB,
  rgbToHex,
  colorDistance,
  rgbToHSL,
  relativeLuminance,
  computeCentroid,
} from "./utils";

// ── Tuning constants ─────────────────────────────────────────────────────────

/** Colors within this Euclidean distance are merged into the same cluster. */
const CLUSTER_THRESHOLD = 48;

/** Minimum luminance for a color to be considered "meaningful" (not near-black). */
const MIN_MEANINGFUL_LUM = 0.025;
/** Maximum luminance for a color to be considered "meaningful" (not near-white). */
const MAX_MEANINGFUL_LUM = 0.90;
/** Minimum saturation for a color to be considered "meaningful". */
const MIN_MEANINGFUL_SAT = 0.04;

// ── Internal cluster type ────────────────────────────────────────────────────

interface Cluster {
  members: RGB[];
  centroid: RGB;
  /** Sum of all member frequencies — higher = more dominant on the page. */
  weight: number;
}

// ── Clustering ───────────────────────────────────────────────────────────────

function buildClusters(
  entries: Array<{ rgb: RGB; count: number }>
): Cluster[] {
  // Greedy nearest-centroid clustering.
  // Process most-frequent colors first so dominant colors seed clusters.
  const raw: Array<{ members: RGB[]; counts: number[] }> = [];

  for (const { rgb, count } of entries) {
    let assigned = false;

    for (const cluster of raw) {
      const centroid = computeCentroid(cluster.members);
      if (colorDistance(rgb, centroid) < CLUSTER_THRESHOLD) {
        cluster.members.push(rgb);
        cluster.counts.push(count);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      raw.push({ members: [rgb], counts: [count] });
    }
  }

  return raw.map((c) => ({
    members: c.members,
    centroid: computeCentroid(c.members),
    weight: c.counts.reduce((a, b) => a + b, 0),
  }));
}

// ── Role detection helpers ───────────────────────────────────────────────────

/** Is this cluster's centroid a meaningful, non-neutral color? */
function isMeaningful(cluster: Cluster): boolean {
  const lum = relativeLuminance(cluster.centroid);
  const hsl = rgbToHSL(cluster.centroid);
  return (
    lum > MIN_MEANINGFUL_LUM &&
    lum < MAX_MEANINGFUL_LUM &&
    hsl.s > MIN_MEANINGFUL_SAT
  );
}

/** Return the actual hex from `entries` that is closest to the given centroid. */
function closestActualColor(
  centroid: RGB,
  entries: Array<{ rgb: RGB; hex: string }>
): string {
  let best = entries[0].hex;
  let bestDist = Infinity;
  for (const e of entries) {
    const d = colorDistance(e.rgb, centroid);
    if (d < bestDist) {
      bestDist = d;
      best = e.hex;
    }
  }
  return best;
}

// ── Main analyzer ────────────────────────────────────────────────────────────

/**
 * Accepts a frequency map of raw CSS color strings (as collected from the page)
 * and returns a fully structured ColorSystem.
 *
 * @param colorFreq  Map<cssColorString, occurrenceCount>
 */
export function analyzeColors(
  colorFreq: Map<string, number>
): ColorSystem {
  // ── Step 1: Normalize all values to HEX, aggregate counts ──────────────
  const hexFreq = new Map<string, number>();

  for (const [raw, count] of colorFreq) {
    const hex = parseColorToHex(raw);
    if (hex) hexFreq.set(hex, (hexFreq.get(hex) ?? 0) + count);
  }

  if (hexFreq.size === 0) return fallback();

  // ── Step 2: Build sorted entry list (most frequent first) ──────────────
  const entries: Array<{ hex: string; rgb: RGB; count: number }> = [];
  for (const [hex, count] of hexFreq) {
    const rgb = hexToRGB(hex);
    if (rgb) entries.push({ hex, rgb, count });
  }
  entries.sort((a, b) => b.count - a.count);

  // ── Step 3: Cluster ────────────────────────────────────────────────────
  const clusters = buildClusters(
    entries.map(({ rgb, count }) => ({ rgb, count }))
  );
  // Sort clusters by total weight (usage frequency)
  clusters.sort((a, b) => b.weight - a.weight);

  // ── Step 4: Background (lightest) & Text (darkest) ────────────────────
  const byLum = [...entries].sort(
    (a, b) => relativeLuminance(a.rgb) - relativeLuminance(b.rgb)
  );
  const background = byLum[byLum.length - 1].hex;
  const text = byLum[0].hex;

  // ── Step 5: Primary & Secondary from meaningful clusters ───────────────
  const meaningful = clusters.filter(isMeaningful);
  // Fallback to all clusters if nothing is "meaningful"
  const pool = meaningful.length >= 2 ? meaningful : clusters;

  const primaryCluster = pool[0] ?? clusters[0];
  const secondaryCluster = pool[1] ?? clusters[Math.min(1, clusters.length - 1)];

  const primary = closestActualColor(primaryCluster.centroid, entries);
  const secondary = closestActualColor(secondaryCluster.centroid, entries);
  const primaryRGB = hexToRGB(primary)!;
  const secondaryRGB = hexToRGB(secondary)!;

  // ── Step 6: Accent — most saturated + vibrant, distinct from primary/secondary
  let accent = primary; // fallback
  let bestAccentScore = -1;

  for (const { rgb, hex } of entries) {
    const hsl = rgbToHSL(rgb);
    const lum = relativeLuminance(rgb);

    // Must be colorful, not too dark/light, and distinct from p/s
    if (
      hsl.s < 0.25 ||
      lum < 0.025 ||
      lum > 0.88
    ) continue;

    const distP = colorDistance(rgb, primaryRGB);
    const distS = colorDistance(rgb, secondaryRGB);
    if (distP < 35 && distS < 35) continue; // too similar to both

    // Score: penalise extremes of lightness, reward saturation
    const brightnessBonus = 1 - Math.abs(hsl.l - 0.45) * 1.5;
    const score = hsl.s * Math.max(0, brightnessBonus);

    if (score > bestAccentScore) {
      bestAccentScore = score;
      accent = hex;
    }
  }

  // Relaxed fallback: just most saturated overall
  if (bestAccentScore === -1) {
    let maxSat = -1;
    for (const { rgb, hex } of entries) {
      const { s } = rgbToHSL(rgb);
      if (s > maxSat) { maxSat = s; accent = hex; }
    }
  }

  // ── Step 7: Build ordered palette ─────────────────────────────────────
  // One representative per cluster (closest actual color to centroid),
  // sorted by cluster weight.
  const seen = new Set<string>();
  const palette: string[] = [];

  for (const cluster of clusters) {
    const rep = closestActualColor(cluster.centroid, entries);
    if (!seen.has(rep)) { seen.add(rep); palette.push(rep); }
  }
  // Fill any remaining unique colors
  for (const { hex } of entries) {
    if (!seen.has(hex)) { seen.add(hex); palette.push(hex); }
  }

  return {
    primary,
    secondary,
    accent,
    background,
    text,
    palette: palette.slice(0, 30),
  };
}

// ── Fallback when no valid colors found ──────────────────────────────────────

function fallback(): ColorSystem {
  return {
    primary:    "#1A1A2E",
    secondary:  "#16213E",
    accent:     "#3A7AFF",
    background: "#FFFFFF",
    text:       "#0A0A0A",
    palette:    ["#1A1A2E", "#16213E", "#3A7AFF"],
  };
}
