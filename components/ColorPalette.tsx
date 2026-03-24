"use client";

import { useState } from "react";
import { ColorSystem } from "@/lib/types";

interface ColorPaletteProps {
  colors: ColorSystem;
}

function useClipboard() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return { copy, copied };
}

function ColorRole({
  role,
  hex,
  copied,
  onCopy,
}: {
  role: string;
  hex: string;
  copied: string | null;
  onCopy: (hex: string) => void;
}) {
  const isCopied = copied === hex;
  return (
    <button
      onClick={() => onCopy(hex)}
      className="group flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 hover:translate-y-[-2px]"
    >
      <div
        className="w-full h-16 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.03]"
        style={{ backgroundColor: hex }}
      />
      <div className="text-left">
        <p className="text-[11px] uppercase tracking-widest text-white/30 font-semibold mb-0.5">
          {role}
        </p>
        <p className="text-sm font-mono text-white/60 group-hover:text-white/80 transition-colors">
          {isCopied ? (
            <span className="text-emerald-400">Copied!</span>
          ) : (
            hex
          )}
        </p>
      </div>
    </button>
  );
}

export default function ColorPalette({ colors }: ColorPaletteProps) {
  const { copy, copied } = useClipboard();

  const roles: Array<{ role: string; hex: string }> = [
    { role: "Primary",    hex: colors.primary },
    { role: "Secondary",  hex: colors.secondary },
    { role: "Accent",     hex: colors.accent },
    { role: "Background", hex: colors.background },
    { role: "Text",       hex: colors.text },
  ];

  return (
    <div className="glass-card rounded-2xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/[0.07] flex items-center justify-center">
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="13.5" cy="6.5" r="2.5" />
              <circle cx="17.5" cy="10.5" r="2.5" />
              <circle cx="8.5"  cy="7.5"  r="2.5" />
              <circle cx="6.5"  cy="12.5" r="2.5" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white/90">Color System</h2>
            <p className="text-xs text-white/25">{colors.palette.length} colors extracted</p>
          </div>
        </div>
        <span className="text-xs text-white/15 font-mono hidden sm:block">click to copy</span>
      </div>

      {/* Role-based color cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {roles.map(({ role, hex }) => (
          <ColorRole
            key={role}
            role={role}
            hex={hex}
            copied={copied}
            onCopy={copy}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-white/[0.05]" />
        <span className="text-xs text-white/20 uppercase tracking-widest font-medium">
          Full Palette
        </span>
        <div className="h-px flex-1 bg-white/[0.05]" />
      </div>

      {/* Full palette grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
        {colors.palette.map((hex, i) => (
          <button
            key={hex + i}
            onClick={() => copy(hex)}
            title={hex}
            className="group flex flex-col items-center gap-1.5"
          >
            <div
              className="w-full aspect-square rounded-lg border border-black/10 transition-transform duration-200 group-hover:scale-110 group-hover:shadow-lg"
              style={{ backgroundColor: hex }}
            />
            <span className="text-[9px] font-mono text-white/20 group-hover:text-white/40 transition-colors truncate w-full text-center">
              {copied === hex ? "✓" : hex.slice(1)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
