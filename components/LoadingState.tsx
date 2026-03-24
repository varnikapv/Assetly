"use client";

export default function LoadingState() {
  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      {/* Loader */}
      <div className="flex flex-col items-center gap-5 py-12 mb-8">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
          <div className="absolute inset-0 rounded-full border border-transparent border-t-white/40 animate-loader-spin" />
          <div className="absolute inset-2 rounded-full border border-transparent border-b-white/20 animate-loader-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          <div className="absolute inset-0 rounded-full animate-loader-pulse border border-white/10" />
        </div>
        <div className="text-center">
          <p className="text-sm text-white/50 font-medium mb-1">Analyzing website…</p>
          <p className="text-xs text-white/20">Extracting colors, fonts, and images</p>
        </div>
      </div>

      {/* Skeleton cards */}
      <div className="space-y-6">
        {/* Color skeleton */}
        <div className="glass-card rounded-2xl p-8 hover:translate-y-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl skeleton" />
            <div className="w-32 h-5 rounded-lg skeleton" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl skeleton" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>

        {/* Font skeleton */}
        <div className="glass-card rounded-2xl p-8 hover:translate-y-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl skeleton" />
            <div className="w-28 h-5 rounded-lg skeleton" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl skeleton" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>

        {/* Image skeleton */}
        <div className="glass-card rounded-2xl p-8 hover:translate-y-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl skeleton" />
            <div className="w-24 h-5 rounded-lg skeleton" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl skeleton" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
