"use client";

interface UrlInputProps {
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export default function UrlInput({
  url,
  setUrl,
  onAnalyze,
  loading,
}: UrlInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && url.trim()) {
      onAnalyze();
    }
  };

  return (
    <div className="w-full">
      <div className="relative group">
        {/* Glow behind input on focus */}
        <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-white/[0.05] via-white/[0.02] to-white/[0.05] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />

        <div className="relative flex items-center">
          {/* Globe icon */}
          <div className="absolute left-5 text-white/25">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter website URL…"
            disabled={loading}
            className="input-glow w-full h-[56px] pl-13 pr-36 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/90 placeholder-white/20 text-[15px] focus:outline-none focus:border-white/15 focus:bg-white/[0.05] transition-all duration-300 disabled:opacity-40"
          />

          <button
            onClick={onAnalyze}
            disabled={loading || !url.trim()}
            className="absolute right-2 h-10 px-6 rounded-full bg-white text-[#0A0A0A] font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                <span>Analyzing</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Analyze</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
