"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { saveAs } from "file-saver";
import { AssetCollection } from "@/lib/types";

interface ImageGridProps {
  assets: AssetCollection;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").pop()?.split("?")[0];
    return name || "asset.png";
  } catch {
    return "asset.png";
  }
}

async function downloadSingle(url: string) {
  const proxyUrl = `/api/download-image?url=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    saveAs(blob, getFilename(url));
  } catch {
    // Fallback: open in new tab so user can save manually
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// ── Preview Modal ─────────────────────────────────────────────────────────────

function PreviewModal({ src, onClose }: { src: string; onClose: () => void }) {
  const [downloading, setDownloading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    await downloadSingle(src);
    setDownloading(false);
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-w-4xl w-full mx-4 rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl bg-[#0c0c0c]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <p className="text-xs text-white/30 font-mono truncate max-w-[60%]">{getFilename(src)}</p>
          <div className="flex items-center gap-2">
            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs text-white/60 hover:bg-white/[0.1] hover:text-white/90 transition-all duration-150 disabled:opacity-50"
            >
              {downloading ? (
                <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
              Download
            </button>
            {/* Open in new tab */}
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs text-white/60 hover:bg-white/[0.1] hover:text-white/90 transition-all duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open
            </a>
            {/* Close */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.1] transition-all duration-150"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image area */}
        <div className="flex items-center justify-center bg-[#080808] p-6 min-h-[300px] max-h-[75vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ── Image Tile ────────────────────────────────────────────────────────────────

function ImageTile({
  src,
  size = "md",
  onError,
  onPreview,
}: {
  src: string;
  size?: "sm" | "md" | "lg";
  onError: () => void;
  onPreview: (src: string) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const aspectClass =
    size === "sm" ? "aspect-square" : size === "lg" ? "aspect-video" : "aspect-square";

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    await downloadSingle(src);
    setDownloading(false);
  };

  return (
    <div
      className={`group relative ${aspectClass} rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.14] transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer`}
      onClick={() => onPreview(src)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={onError}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top-right: download button */}
      <button
        onClick={handleDownload}
        title="Download image"
        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-[-4px] group-hover:translate-y-0 hover:bg-black/70 hover:border-white/20"
      >
        {downloading ? (
          <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
      </button>

    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
  count,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-white/70">{label}</span>
      <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/30 font-mono">
        {count}
      </span>
      <div className="h-px flex-1 bg-white/[0.05]" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ImageGrid({ assets }: ImageGridProps) {
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  const visible = (urls: string[]) => urls.filter((u) => !failed.has(u));
  const fail = (url: string) => setFailed((prev) => new Set(prev).add(url));

  const logos         = visible(assets.logos);
  const icons         = visible(assets.icons);
  const illustrations = visible(assets.illustrations);
  const backgrounds   = visible(assets.backgrounds);
  const others        = visible(assets.others);

  const totalVisible = logos.length + icons.length + illustrations.length + backgrounds.length + others.length;
  if (totalVisible === 0) return null;

  const badgeData = [
    { label: "logos",         count: logos.length },
    { label: "icons",         count: icons.length },
    { label: "illustrations", count: illustrations.length },
    { label: "backgrounds",   count: backgrounds.length },
    { label: "others",        count: others.length },
  ].filter((b) => b.count > 0);

  async function handleBulkDownload() {
    if (zipping) return;
    setZipping(true);
    try {
      const res = await fetch("/api/download-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logos, icons, illustrations, backgrounds, others }),
      });
      if (!res.ok) throw new Error("zip failed");
      const blob = await res.blob();
      saveAs(blob, "assets.zip");
    } catch {
      // silently fail — user can still download individually
    } finally {
      setZipping(false);
    }
  }

  return (
    <>
      {preview && <PreviewModal src={preview} onClose={() => setPreview(null)} />}

      <div className="glass-card rounded-2xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/[0.07] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white/90">Assets</h2>
              <p className="text-xs text-white/25">{totalVisible} images categorized</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* Badges */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {badgeData.map((b) => (
                <span key={b.label} className="text-[10px] px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/25">
                  {b.count} {b.label}
                </span>
              ))}
            </div>

            {/* Bulk download */}
            <button
              onClick={handleBulkDownload}
              disabled={zipping}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs font-medium text-white/70 hover:bg-white/[0.1] hover:text-white/90 hover:border-white/[0.18] hover:shadow-[0_0_16px_rgba(255,255,255,0.04)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {zipping ? (
                <>
                  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Preparing ZIP…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download All
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* ── Logos ── */}
          {logos.length > 0 && (
            <div>
              <SectionHeader
                label="Logos & Brand"
                count={logos.length}
                color="bg-violet-500/15 border border-violet-500/20"
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {logos.map((src) => (
                  <ImageTile key={src} src={src} size="sm" onError={() => fail(src)} onPreview={setPreview} />
                ))}
              </div>
            </div>
          )}

          {/* ── Icons ── */}
          {icons.length > 0 && (
            <div>
              <SectionHeader
                label="Icons"
                count={icons.length}
                color="bg-sky-500/15 border border-sky-500/20"
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(56,189,248,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                }
              />
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {icons.map((src) => (
                  <ImageTile key={src} src={src} size="sm" onError={() => fail(src)} onPreview={setPreview} />
                ))}
              </div>
            </div>
          )}

          {/* ── Illustrations ── */}
          {illustrations.length > 0 && (
            <div>
              <SectionHeader
                label="Illustrations"
                count={illustrations.length}
                color="bg-amber-500/15 border border-amber-500/20"
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                    <circle cx="11" cy="11" r="2" />
                  </svg>
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {illustrations.map((src) => (
                  <ImageTile key={src} src={src} size="md" onError={() => fail(src)} onPreview={setPreview} />
                ))}
              </div>
            </div>
          )}

          {/* ── Backgrounds ── */}
          {backgrounds.length > 0 && (
            <div>
              <SectionHeader
                label="Backgrounds"
                count={backgrounds.length}
                color="bg-emerald-500/15 border border-emerald-500/20"
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                  </svg>
                }
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {backgrounds.map((src) => (
                  <ImageTile key={src} src={src} size="lg" onError={() => fail(src)} onPreview={setPreview} />
                ))}
              </div>
            </div>
          )}

          {/* ── Others ── */}
          {others.length > 0 && (
            <div>
              <SectionHeader
                label="Others"
                count={others.length}
                color="bg-white/[0.05] border border-white/[0.08]"
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {others.map((src) => (
                  <ImageTile key={src} src={src} size="md" onError={() => fail(src)} onPreview={setPreview} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
