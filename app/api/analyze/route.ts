import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import { analyzeColors } from "@/lib/analyzer/colorAnalyzer";
import { analyzeFonts } from "@/lib/analyzer/fontAnalyzer";
import { analyzeImages } from "@/lib/analyzer/imageAnalyzer";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let normalizedUrl = url.trim();
    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    await page.goto(normalizedUrl, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // ── Collect raw data with frequency counts ──────────────────────────────
    // page.evaluate returns plain JSON, so we use Record<string,number> maps.
    const raw = await page.evaluate(() => {
      const colorMap: Record<string, number> = {};
      const fontMap: Record<string, number> = {};
      const imageSet = new Set<string>();

      const elements = document.querySelectorAll("*");

      elements.forEach((el) => {
        const s = getComputedStyle(el);

        // Collect every color property that carries visual meaning
        const colorProps = [
          s.color,
          s.backgroundColor,
          s.borderTopColor,
          s.borderBottomColor,
          s.borderLeftColor,
          s.borderRightColor,
          s.outlineColor,
          s.fill,
          s.stroke,
        ];
        for (const c of colorProps) {
          if (c && c !== "none" && c !== "transparent") {
            colorMap[c] = (colorMap[c] ?? 0) + 1;
          }
        }

        // Font families — raw string with full fallback stack
        const ff = s.fontFamily;
        if (ff) fontMap[ff] = (fontMap[ff] ?? 0) + 1;

        // Background images
        const bgImage = s.backgroundImage;
        if (bgImage && bgImage !== "none") {
          const m = bgImage.match(/url\(["']?(.*?)["']?\)/);
          if (m?.[1] && !m[1].startsWith("data:")) {
            imageSet.add(m[1]);
          }
        }
      });

      // <img> tags
      document.querySelectorAll("img").forEach((img) => {
        if (img.src && !img.src.startsWith("data:")) imageSet.add(img.src);
      });

      // <picture><source srcset>
      document.querySelectorAll("source[srcset]").forEach((src) => {
        const first = (src as HTMLSourceElement).srcset.split(",")[0]?.trim().split(" ")[0];
        if (first && first.startsWith("http")) imageSet.add(first);
      });

      return {
        colors: colorMap,    // { [cssColorString]: count }
        fonts:  fontMap,     // { [cssFontFamilyString]: count }
        images: Array.from(imageSet),
      };
    });

    await browser.close();
    browser = null;

    // ── Pass to analyzer layer ──────────────────────────────────────────────
    const colorFreq = new Map(Object.entries(raw.colors));
    const fontFreq  = new Map(Object.entries(raw.fonts));

    const colors = analyzeColors(colorFreq);
    const fonts  = analyzeFonts(fontFreq);
    const assets = analyzeImages(raw.images);

    return NextResponse.json({ colors, fonts, assets });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error:
          "Unable to analyze this website. It may restrict automated access.",
      },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
