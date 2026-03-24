import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

const MAX_IMAGES = 100;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

/** Extract a safe filename from a URL, deduplicating with an index. */
function toFilename(url: string, index: number): string {
  try {
    const pathname = new URL(url).pathname;
    const raw = pathname.split("/").pop() || "";
    // Strip query-params that may have leaked in
    const clean = raw.split("?")[0];
    if (clean) return clean;
  } catch {
    // fall through
  }
  return `asset-${index}`;
}

/** Fetch one image and return its ArrayBuffer, or null on failure. */
async function fetchImage(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, string[]>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const categories: Record<string, string[]> = {
    logos:         (body.logos         ?? []).slice(0, MAX_IMAGES),
    icons:         (body.icons         ?? []).slice(0, MAX_IMAGES),
    illustrations: (body.illustrations ?? []).slice(0, MAX_IMAGES),
    backgrounds:   (body.backgrounds   ?? []).slice(0, MAX_IMAGES),
    others:        (body.others        ?? []).slice(0, MAX_IMAGES),
  };

  const zip = new JSZip();

  await Promise.all(
    Object.entries(categories).map(async ([folderName, urls]) => {
      if (urls.length === 0) return;
      const folder = zip.folder(folderName)!;

      await Promise.all(
        urls.map(async (url, i) => {
          const data = await fetchImage(url);
          if (data) {
            folder.file(toFilename(url, i), data);
          }
        })
      );
    })
  );

  const zipUint8 = await zip.generateAsync({ type: "uint8array" });
  // Copy into a plain ArrayBuffer to satisfy strict TypeScript checks
  const arrayBuffer = zipUint8.buffer.slice(
    zipUint8.byteOffset,
    zipUint8.byteOffset + zipUint8.byteLength
  ) as ArrayBuffer;

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="assets.zip"',
    },
  });
}
