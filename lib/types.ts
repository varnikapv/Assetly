// ── Color System ────────────────────────────────────────────────────────────

export interface ColorSystem {
  /** Most dominant non-neutral color */
  primary: string;
  /** Second most dominant */
  secondary: string;
  /** Most saturated / vibrant color */
  accent: string;
  /** Lightest color (background candidate) */
  background: string;
  /** Darkest color (text candidate) */
  text: string;
  /** All unique colors, representative of clusters, sorted by frequency */
  palette: string[];
}

// ── Font System ──────────────────────────────────────────────────────────────

export interface FontSystem {
  /** Most frequently used branded font */
  primary: string;
  /** Second most used */
  secondary: string;
  /** Full deduplicated list */
  all: string[];
}

// ── Asset Collection ─────────────────────────────────────────────────────────

export interface AssetCollection {
  logos: string[];
  icons: string[];
  illustrations: string[];
  backgrounds: string[];
  others: string[];
}

// ── Top-Level Result ─────────────────────────────────────────────────────────

export interface AnalysisResult {
  colors: ColorSystem;
  fonts: FontSystem;
  assets: AssetCollection;
}

export interface AnalysisError {
  error: string;
}
