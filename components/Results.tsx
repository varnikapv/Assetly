"use client";

import { AnalysisResult } from "@/lib/types";
import ColorPalette from "./ColorPalette";
import FontList from "./FontList";
import ImageGrid from "./ImageGrid";

interface ResultsProps {
  data: AnalysisResult;
  url: string;
}

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
      <span className="text-lg font-bold text-white/70 font-mono">{value}</span>
      <span className="text-xs text-white/30">{label}</span>
    </div>
  );
}

export default function Results({ data, url }: ResultsProps) {
  const totalImages =
    data.assets.logos.length +
    data.assets.icons.length +
    data.assets.illustrations.length +
    data.assets.backgrounds.length +
    data.assets.others.length;

  return (
    <div className="space-y-8">
      {/* Results header strip */}
      <div className="glass-card rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
          <div className="min-w-0">
            <p className="text-xs text-white/35 mb-0.5">Analysis complete</p>
            <p className="text-sm text-white/65 font-medium truncate">{url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatBadge label="colors"  value={data.colors.palette.length} />
          <StatBadge label="fonts"   value={data.fonts.all.length} />
          <StatBadge label="images"  value={totalImages} />
        </div>
      </div>

      {/* Design system cards */}
      <div id="section-colors"><ColorPalette colors={data.colors} /></div>
      <div id="section-fonts"><FontList     fonts={data.fonts} /></div>
      <div id="section-images"><ImageGrid    assets={data.assets} /></div>
    </div>
  );
}
