"use client";

import { FontSystem } from "@/lib/types";

interface FontListProps {
  fonts: FontSystem;
}

const SAMPLE_TEXT = "Aa Bb Cc Dd — 0123";

function PrimaryFontCard({ name }: { name: string }) {
  return (
    <div className="group col-span-2 sm:col-span-1 flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 hover:translate-y-[-2px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-white/25 font-semibold block mb-1">
            Primary
          </span>
          <span className="text-sm font-semibold text-white/80 group-hover:text-white/95 transition-colors">
            {name}
          </span>
        </div>
        <div className="px-2 py-1 rounded-full bg-white/[0.05] border border-white/[0.07]">
          <span className="text-[10px] font-mono text-white/30">P1</span>
        </div>
      </div>
      {/* Large preview */}
      <div className="border-t border-white/[0.04] pt-4 space-y-2">
        <p
          className="text-5xl font-bold text-white/20 group-hover:text-white/35 transition-colors leading-none"
          style={{ fontFamily: `"${name}", system-ui, sans-serif` }}
        >
          Aa
        </p>
        <p
          className="text-base text-white/25 group-hover:text-white/40 transition-colors"
          style={{ fontFamily: `"${name}", system-ui, sans-serif` }}
        >
          Bb Cc Dd Ee Ff Gg
        </p>
        <p
          className="text-sm text-white/20 group-hover:text-white/35 transition-colors font-mono"
          style={{ fontFamily: `"${name}", system-ui, sans-serif` }}
        >
          0 1 2 3 4 5 6 7 8 9
        </p>
      </div>
    </div>
  );
}

function SecondaryFontCard({ name, index }: { name: string; index: number }) {
  const label = index === 0 ? "Secondary" : `Font ${index + 2}`;
  const code = index === 0 ? "P2" : `P${index + 2}`;
  return (
    <div className="group flex flex-col gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.10] hover:bg-white/[0.03] transition-all duration-300 hover:translate-y-[-2px]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-white/20 font-semibold block mb-0.5">
            {label}
          </span>
          <span className="text-sm font-medium text-white/65 group-hover:text-white/85 transition-colors">
            {name}
          </span>
        </div>
        <div className="px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
          <span className="text-[10px] font-mono text-white/20">{code}</span>
        </div>
      </div>
      <div className="border-t border-white/[0.04] pt-3">
        <p
          className="text-2xl text-white/25 group-hover:text-white/40 transition-colors"
          style={{ fontFamily: `"${name}", system-ui, sans-serif` }}
        >
          {SAMPLE_TEXT}
        </p>
      </div>
    </div>
  );
}

export default function FontList({ fonts }: FontListProps) {
  if (fonts.all.length === 0) return null;

  const [primary, ...rest] = fonts.all;
  const otherFonts = rest.filter((f) => f !== fonts.secondary);
  const secondary = fonts.secondary !== fonts.primary ? fonts.secondary : rest[0];

  return (
    <div className="glass-card rounded-2xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/[0.07] flex items-center justify-center">
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white/90">Typography</h2>
            <p className="text-xs text-white/25">{fonts.all.length} font families detected</p>
          </div>
        </div>
      </div>

      {/* Primary + Secondary large cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <PrimaryFontCard name={primary} />
        {secondary && secondary !== primary && (
          <SecondaryFontCard name={secondary} index={0} />
        )}
      </div>

      {/* Remaining fonts */}
      {otherFonts.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-white/[0.05]" />
            <span className="text-xs text-white/20 uppercase tracking-widest font-medium">
              Additional Fonts
            </span>
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {otherFonts.slice(0, 6).map((font, i) => (
              <SecondaryFontCard key={font} name={font} index={i + 1} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
