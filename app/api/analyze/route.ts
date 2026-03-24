import { NextRequest, NextResponse } from "next/server";
import { analyzeColors } from "@/lib/analyzer/colorAnalyzer";
import { analyzeFonts } from "@/lib/analyzer/fontAnalyzer";
import { analyzeImages } from "@/lib/analyzer/imageAnalyzer";

export const maxDuration = 60;

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

// ── URL helpers ───────────────────────────────────────────────────────────────

function resolve(base: string, relative: string): string | null {
  try {
    const u = new URL(relative, base);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

// ── CSS extraction helpers ────────────────────────────────────────────────────

const COLOR_RE =
  /(?:^|[{;])\s*(?:color|background(?:-color)?|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?-color|outline-color|fill|stroke)\s*:\s*([^;}"'\n]+)/gi;

const FONT_RE = /(?:^|[{;])\s*font-family\s*:\s*([^;}"'\n]+)/gi;

const URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;

function extractColors(css: string): [string, number][] {
  const out: [string, number][] = [];
  let m: RegExpExecArray | null;
  COLOR_RE.lastIndex = 0;
  while ((m = COLOR_RE.exec(css)) !== null) {
    const v = m[1].trim();
    if (v && v !== "transparent" && v !== "inherit" && v !== "currentColor" && v !== "none")
      out.push([v, 1]);
  }
  return out;
}

function extractFonts(css: string): [string, number][] {
  const out: [string, number][] = [];
  let m: RegExpExecArray | null;
  FONT_RE.lastIndex = 0;
  while ((m = FONT_RE.exec(css)) !== null) {
    const v = m[1].trim();
    if (v) out.push([v, 1]);
  }
  return out;
}

function extractCssImageUrls(css: string, base: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(css)) !== null) {
    const raw = m[1].trim();
    if (raw.startsWith("data:")) continue;
    const resolved = resolve(base, raw);
    if (resolved) out.push(resolved);
  }
  return out;
}

// ── HTML attribute extraction (regex, no DOM) ─────────────────────────────────

/** Extract value of a specific HTML attribute from a tag string. */
function attr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const m = re.exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3] ?? null) : null;
}

// ── Main scraper ──────────────────────────────────────────────────────────────

async function scrapePage(pageUrl: string) {
  const colorMap: Record<string, number> = {};
  const fontMap: Record<string, number> = {};
  const imageSet = new Set<string>();

  function addColors(pairs: [string, number][]) {
    for (const [k] of pairs) colorMap[k] = (colorMap[k] ?? 0) + 1;
  }
  function addFonts(pairs: [string, number][]) {
    for (const [k] of pairs) fontMap[k] = (fontMap[k] ?? 0) + 1;
  }
  function processCSS(css: string) {
    addColors(extractColors(css));
    addFonts(extractFonts(css));
    for (const u of extractCssImageUrls(css, pageUrl)) imageSet.add(u);
  }

  // ── 1. Fetch the HTML page ───────────────────────────────────────────────
  const pageRes = await fetch(pageUrl, { headers: FETCH_HEADERS });
  if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status} fetching page`);
  const html = await pageRes.text();

  // ── 2. Inline style attributes ──────────────────────────────────────────
  const inlineStyleRe = /style\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let m: RegExpExecArray | null;
  while ((m = inlineStyleRe.exec(html)) !== null) {
    processCSS(m[1] ?? m[2] ?? "");
  }

  // ── 3. <style> blocks ───────────────────────────────────────────────────
  const styleBlockRe = /<style(?:\s[^>]*)?>([^]*?)<\/style>/gi;
  while ((m = styleBlockRe.exec(html)) !== null) processCSS(m[1]);

  // ── 4. Linked CSS files (fetch concurrently, limit 15) ──────────────────
  const cssUrls: string[] = [];
  const linkRe = /<link([^>]+)>/gi;
  while ((m = linkRe.exec(html)) !== null) {
    const tag = m[1];
    const rel = attr(tag, "rel") ?? "";
    if (!rel.includes("stylesheet")) continue;
    const href = attr(tag, "href");
    if (!href) continue;
    const resolved = resolve(pageUrl, href);
    if (resolved) cssUrls.push(resolved);
  }

  await Promise.all(
    cssUrls.slice(0, 15).map(async (cssUrl) => {
      try {
        const r = await fetch(cssUrl, { headers: FETCH_HEADERS });
        if (r.ok) processCSS(await r.text());
      } catch { /* skip */ }
    })
  );

  // ── 5. <img> src ─────────────────────────────────────────────────────────
  const imgRe = /<img([^>]+)>/gi;
  while ((m = imgRe.exec(html)) !== null) {
    const src = attr(m[1], "src");
    if (src && !src.startsWith("data:")) {
      const resolved = resolve(pageUrl, src);
      if (resolved) imageSet.add(resolved);
    }
    // srcset on <img>
    const srcset = attr(m[1], "srcset");
    if (srcset) {
      const first = srcset.split(",")[0]?.trim().split(/\s+/)[0];
      if (first && !first.startsWith("data:")) {
        const resolved = resolve(pageUrl, first);
        if (resolved) imageSet.add(resolved);
      }
    }
  }

  // ── 6. <source srcset> (<picture>) ───────────────────────────────────────
  const sourceRe = /<source([^>]+)>/gi;
  while ((m = sourceRe.exec(html)) !== null) {
    const srcset = attr(m[1], "srcset");
    if (srcset) {
      const first = srcset.split(",")[0]?.trim().split(/\s+/)[0];
      if (first && !first.startsWith("data:")) {
        const resolved = resolve(pageUrl, first);
        if (resolved) imageSet.add(resolved);
      }
    }
  }

  // ── 7. SVG <image> href / xlink:href ─────────────────────────────────────
  const svgImgRe = /<image([^>]+)>/gi;
  while ((m = svgImgRe.exec(html)) !== null) {
    const href = attr(m[1], "href") ?? attr(m[1], "xlink:href");
    if (href && !href.startsWith("data:")) {
      const resolved = resolve(pageUrl, href);
      if (resolved) imageSet.add(resolved);
    }
  }

  return {
    colors: colorMap,
    fonts: fontMap,
    images: Array.from(imageSet),
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const raw = await scrapePage(normalizedUrl);

    const colorFreq = new Map(Object.entries(raw.colors));
    const fontFreq  = new Map(Object.entries(raw.fonts));

    const colors = analyzeColors(colorFreq);
    const fonts  = analyzeFonts(fontFreq);
    const assets = analyzeImages(raw.images);

    return NextResponse.json({ colors, fonts, assets });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Unable to analyze this website. It may restrict automated access." },
      { status: 500 }
    );
  }
}
