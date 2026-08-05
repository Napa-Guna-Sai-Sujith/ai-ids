export default function FlowDiagram() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="w-1 h-8 bg-blue-500 rounded-full" />
        <h2 className="text-2xl font-bold text-white">Data Flow Pipeline</h2>
      </div>
      <p className="text-center text-slate-400 mb-10 text-sm">Real-time network traffic analysis pipeline</p>

      <div className="relative flex flex-col md:flex-row items-center justify-center gap-0">
        {/* Step 1: Network Traffic */}
        <div className="relative group">
          <div className="w-64 h-48 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/30 p-5 flex flex-col items-center justify-center text-center transition-all duration-300 group-hover:scale-105 group-hover:border-blue-400/50 group-hover:shadow-lg group-hover:shadow-blue-500/10">
            <div className="mb-3 p-3 bg-blue-500/10 rounded-xl">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="18" stroke="#3b82f6" strokeWidth="2" fill="rgba(59,130,246,0.1)" />
                <circle cx="18" cy="18" r="3" fill="#3b82f6" />
                <circle cx="30" cy="16" r="3" fill="#3b82f6" />
                <circle cx="14" cy="28" r="3" fill="#3b82f6" />
                <circle cx="34" cy="28" r="3" fill="#3b82f6" />
                <circle cx="24" cy="32" r="3" fill="#3b82f6" />
                <path d="M18 18l12-2M18 18l-4 10M30 16l4 12M30 16l-6 16M14 28l10 4M34 28l-10 4" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
                <circle cx="24" cy="24" r="6" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="2 2" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Network Traffic</h3>
            <p className="text-blue-300/70 text-xs">Packet Capture & Flow Analysis</p>
            <div className="mt-2 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-blink"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
          {/* Animated particles around the card */}
          <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-blue-400 animate-ping opacity-60" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-blue-400 animate-ping opacity-60" style={{ animationDelay: '1s' }} />
        </div>

        {/* Arrow 1 */}
        <div className="relative flex items-center justify-center w-20 md:w-32">
          <svg className="w-full" viewBox="0 0 120 60" fill="none">
            {/* Animated dashed line */}
            <line x1="0" y1="30" x2="90" y2="30" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" className="animate-dash" />
            {/* Arrow head */}
            <path d="M88 22l10 8-10 8" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Flowing particles */}
            <circle r="3" fill="#60a5fa" opacity="0.8">
              <animateMotion dur="2s" repeatCount="indefinite" path="M0,30 L90,30" />
            </circle>
            <circle r="2" fill="#93c5fd" opacity="0.5">
              <animateMotion dur="2s" begin="0.7s" repeatCount="indefinite" path="M0,30 L90,30" />
            </circle>
            <circle r="2" fill="#93c5fd" opacity="0.5">
              <animateMotion dur="2s" begin="1.4s" repeatCount="indefinite" path="M0,30 L90,30" />
            </circle>
          </svg>
          <div className="absolute top-1/2 -translate-y-1/2 bg-slate-900 px-2 py-0.5 rounded text-[10px] text-blue-400 font-mono border border-blue-500/30">
            STREAM
          </div>
        </div>

        {/* Step 2: AI Model */}
        <div className="relative group">
          <div className="w-64 h-48 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-800/10 border border-indigo-500/30 p-5 flex flex-col items-center justify-center text-center transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-400/50 group-hover:shadow-lg group-hover:shadow-indigo-500/10">
            <div className="mb-3 p-3 bg-indigo-500/10 rounded-xl">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                {/* Neural network */}
                {[12, 24, 36].map((x) =>
                  [12, 24, 36].map((y) => (
                    <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#a78bfa" opacity={0.7} />
                  ))
                )}
                {/* Connections */}
                {[12, 24, 36].map((x1, i) =>
                  [12, 24, 36].map((y2) => (
                    <line key={`${i}-${y2}`} x1={x1} y1={12} x2={x1} y2={y2} stroke="#a78bfa" strokeWidth="0.5" opacity="0.3" />
                  ))
                )}
                <path d="M12 12L24 24L36 12" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
                <path d="M12 24L24 24L36 24" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
                <path d="M12 36L24 24L36 36" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
                <circle cx="24" cy="24" r="5" stroke="#c4b5fd" strokeWidth="1.5" fill="rgba(167,139,250,0.2)" />
                <circle cx="24" cy="24" r="2" fill="#c4b5fd" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">AI Model</h3>
            <p className="text-indigo-300/70 text-xs">ML Classification Engine</p>
            <div className="mt-2 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-blink"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
          <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-indigo-400 animate-ping opacity-60" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-purple-400 animate-ping opacity-60" style={{ animationDelay: '0.8s' }} />
        </div>

        {/* Arrow 2 */}
        <div className="relative flex items-center justify-center w-20 md:w-32">
          <svg className="w-full" viewBox="0 0 120 60" fill="none">
            <line x1="0" y1="30" x2="90" y2="30" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" className="animate-dash" />
            <path d="M88 22l10 8-10 8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle r="3" fill="#f87171" opacity="0.8">
              <animateMotion dur="2s" repeatCount="indefinite" path="M0,30 L90,30" />
            </circle>
            <circle r="2" fill="#fca5a5" opacity="0.5">
              <animateMotion dur="2s" begin="0.7s" repeatCount="indefinite" path="M0,30 L90,30" />
            </circle>
            <circle r="2" fill="#fca5a5" opacity="0.5">
              <animateMotion dur="2s" begin="1.4s" repeatCount="indefinite" path="M0,30 L90,30" />
            </circle>
          </svg>
          <div className="absolute top-1/2 -translate-y-1/2 bg-slate-900 px-2 py-0.5 rounded text-[10px] text-red-400 font-mono border border-red-500/30">
            CLASSIFY
          </div>
        </div>

        {/* Step 3: Attack Detection */}
        <div className="relative group">
          <div className="w-64 h-48 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-800/10 border border-red-500/30 p-5 flex flex-col items-center justify-center text-center transition-all duration-300 group-hover:scale-105 group-hover:border-red-400/50 group-hover:shadow-lg group-hover:shadow-red-500/10">
            <div className="mb-3 p-3 bg-red-500/10 rounded-xl">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M24 4L6 14v16c0 10 18 18 18 18s18-8 18-18V14L24 4z" stroke="#ef4444" strokeWidth="2" fill="rgba(239,68,68,0.1)" />
                <path d="M18 26l4 4 8-8" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Attack Detection</h3>
            <p className="text-red-300/70 text-xs">Alert & Classification Output</p>
            <div className="mt-2 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-red-400 animate-blink"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
          <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-red-400 animate-ping opacity-60" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-red-400 animate-ping opacity-60" style={{ animationDelay: '1.2s' }} />
        </div>
      </div>
    </div>
  );
}
