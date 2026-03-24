"use client";

import { useState } from "react";
import UrlInput from "@/components/UrlInput";
import Results from "@/components/Results";
import LoadingState from "@/components/LoadingState";
import { AnalysisResult } from "@/lib/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState("");

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setAnalyzedUrl(url.trim());

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to analyze this website. It may restrict automated access."
        );
        return;
      }

      setResult(data);
    } catch {
      setError(
        "Unable to analyze this website. It may restrict automated access."
      );
    } finally {
      setLoading(false);
    }
  };

  const showHero = !result && !loading && !error;
  const hasResult = result !== null;

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goHome() {
    setResult(null);
    setError(null);
    setUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ── BACKGROUND LAYER ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main ambient glow — top-right warm blob */}
        <div className="absolute -top-32 right-0 w-[800px] h-[600px] rounded-full blur-[150px] animate-blob-slow"
          style={{ background: "radial-gradient(ellipse at center, rgba(120, 140, 100, 0.15), rgba(80, 90, 70, 0.08), transparent 70%)" }}
        />
        {/* Bottom-left cool glow */}
        <div className="absolute bottom-0 -left-32 w-[600px] h-[500px] rounded-full blur-[130px] animate-blob animation-delay-4000"
          style={{ background: "radial-gradient(ellipse at center, rgba(80, 100, 90, 0.1), transparent 70%)" }}
        />
        {/* Center subtle white glow for hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] animate-blob-slow animation-delay-2000"
          style={{ background: "radial-gradient(ellipse at center, rgba(200, 210, 190, 0.06), transparent 70%)" }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Vertical subtle lines — like the reference */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-[30%] bg-gradient-to-t from-white/[0.04] to-transparent" />
        <div className="absolute bottom-0 left-[calc(50%-120px)] w-[1px] h-[20%] bg-gradient-to-t from-white/[0.03] to-transparent" />
        <div className="absolute bottom-0 left-[calc(50%+120px)] w-[1px] h-[25%] bg-gradient-to-t from-white/[0.03] to-transparent" />
      </div>

      {/* ── FLOATING CORNER NODES (Reference design) ── */}
      {showHero && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* SVG connecting lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Top-left curve */}
            <path
              d="M 120 200 Q 200 300 350 350 Q 500 400 650 370"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
              className="animate-draw-line"
            />
            {/* Top-right curve */}
            <path
              d="M 1200 180 Q 1100 250 950 300 Q 800 350 700 370"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
              className="animate-draw-line"
              style={{ animationDelay: "0.5s" }}
            />
            {/* Bottom-left curve */}
            <path
              d="M 100 600 Q 200 550 350 500 Q 450 470 550 450"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
              className="animate-draw-line"
              style={{ animationDelay: "1s" }}
            />
            {/* Bottom-right curve */}
            <path
              d="M 1250 580 Q 1100 520 950 480 Q 850 460 750 450"
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
              className="animate-draw-line"
              style={{ animationDelay: "1.5s" }}
            />
          </svg>

          {/* ── Top-Left Node: "Palette" ── */}
          <div className="absolute top-[18%] left-[8%] flex items-center gap-3 animate-fade-in-up-delay-1">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r="2.5" />
                <circle cx="17.5" cy="10.5" r="2.5" />
                <circle cx="8.5" cy="7.5" r="2.5" />
                <circle cx="6.5" cy="12.5" r="2.5" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-white/30" />
                <span className="text-sm text-white/50 font-medium">Palette</span>
              </div>
              <span className="text-xs text-white/20 font-mono">colors</span>
            </div>
          </div>

          {/* ── Top-Right Node: "Typography" ── */}
          <div className="absolute top-[15%] right-[8%] flex items-center gap-3 animate-fade-in-up-delay-2">
            <div>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-sm text-white/50 font-medium">Typography</span>
                <div className="w-1 h-1 rounded-full bg-white/30" />
              </div>
              <span className="text-xs text-white/20 font-mono text-right block">fonts</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7" />
                <line x1="9" y1="20" x2="15" y2="20" />
                <line x1="12" y1="4" x2="12" y2="20" />
              </svg>
            </div>
          </div>

          {/* ── Bottom-Left Node: "Assets" ── */}
          <div className="absolute bottom-[22%] left-[6%] flex items-center gap-3 animate-fade-in-up-delay-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center animate-node-pulse">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-white/30" />
                <span className="text-sm text-white/50 font-medium">Assets</span>
              </div>
              <span className="text-xs text-white/20 font-mono">images</span>
            </div>
          </div>

          {/* ── Bottom-Right Node: "Extract" ── */}
          <div className="absolute bottom-[18%] right-[7%] flex items-center gap-3 animate-fade-in-up-delay-3">
            <div>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-sm text-white/50 font-medium">Extract</span>
                <div className="w-1 h-1 rounded-full bg-white/30" />
              </div>
              <span className="text-xs text-white/20 font-mono text-right block">analyze</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center animate-node-pulse animation-delay-2000">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5">
        {/* Logo */}
        <span
          className="text-[26px] italic text-white/90 tracking-wide leading-none"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Assetly.
        </span>

        {/* Center nav: Home + Result */}
        <div className="hidden md:flex items-center gap-1 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
          {/* Home */}
          <button
            onClick={goHome}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
              showHero
                ? "text-white/80 bg-white/[0.06]"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            Home
          </button>

          {/* Result — with dropdown */}
          <div className="relative group">
            <button
              className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                hasResult
                  ? "text-white/80 bg-white/[0.06] group-hover:bg-white/[0.09]"
                  : "text-white/25 cursor-default"
              }`}
              disabled={!hasResult}
            >
              Result
              {/* Chevron — only when result exists */}
              {hasResult && (
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="transition-transform duration-200 group-hover:rotate-180"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>

            {/* Dropdown — only rendered when result exists */}
            {hasResult && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 rounded-xl bg-[#0e0e0e] border border-white/[0.08] shadow-2xl shadow-black/60 overflow-hidden opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top pointer-events-none group-hover:pointer-events-auto">
                <div className="py-1.5">
                  {[
                    { label: "Colors",     id: "section-colors",  dot: "bg-violet-400" },
                    { label: "Fonts",      id: "section-fonts",   dot: "bg-sky-400" },
                    { label: "Images",     id: "section-images",  dot: "bg-emerald-400" },
                  ].map(({ label, id, dot }) => (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-white/50 hover:text-white/85 hover:bg-white/[0.05] transition-all duration-150 text-left"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
            hasResult
              ? "bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
              : "bg-white/20"
          }`} />
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-6">
        {/* HERO SECTION */}
        {showHero && (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto -mt-10">
            {/* Pill badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.07] mb-8">
              <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
              </div>
              <span className="text-xs text-white/50 font-medium">Unlock Your Assets Spark!</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </div>

            {/* Main heading */}
            <h1 className="animate-fade-in-up-delay-1 text-center text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold tracking-tight leading-[1.05] mb-6">
              <span className="text-white/90">Extract Any Website&apos;s</span>
              <br />
              <span className="bg-gradient-to-r from-white/80 via-white/50 to-white/30 bg-clip-text text-transparent">
                Design Instantly
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up-delay-2 text-center text-white/35 text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-10">
              Get colors, fonts, and assets from any website in seconds.
              One click to extract everything.
            </p>

            {/* Search bar */}
            <div className="animate-fade-in-up-delay-3 w-full max-w-2xl">
              <UrlInput
                url={url}
                setUrl={setUrl}
                onAnalyze={handleAnalyze}
                loading={loading}
              />
            </div>

            {/* Bottom-right label */}
            <div className="absolute bottom-8 right-8 hidden lg:block animate-fade-in">
              <span className="text-xs text-white/20 font-medium tracking-wider">Design horizons</span>
              <div className="mt-2 w-8 h-[2px] bg-white/10 ml-auto" />
            </div>
          </div>
        )}

        {/* COMPACT HEADER — when results or loading */}
        {!showHero && (
          <div className="w-full max-w-5xl mx-auto pt-8 pb-4 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90 mb-2">
                Extract Any Website&apos;s Design
              </h1>
              <p className="text-sm text-white/30">Paste a URL and discover its design DNA</p>
            </div>
            <div className="max-w-2xl mx-auto mb-8">
              <UrlInput
                url={url}
                setUrl={setUrl}
                onAnalyze={handleAnalyze}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && <LoadingState />}

        {/* ERROR STATE */}
        {error && (
          <div className="w-full max-w-xl mx-auto animate-fade-in-up">
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/[0.08] border border-red-500/[0.1] flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white/80 mb-2">Unable to Analyze</h3>
              <p className="text-sm text-white/35 leading-relaxed max-w-sm mx-auto">{error}</p>
              <button
                onClick={() => { setError(null); }}
                className="mt-5 px-5 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-white/50 hover:bg-white/[0.08] hover:text-white/70 transition-all duration-300"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {result && !loading && (
          <div className="w-full max-w-5xl mx-auto pb-16 animate-fade-in-up">
            <Results data={result} url={analyzedUrl} />
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.04] px-6 sm:px-10 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-6 text-xs text-white/15">
            <span className="hidden sm:inline">Assetly</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/15">
            <span className="hidden sm:inline">Built with Next.js + Playwright</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
