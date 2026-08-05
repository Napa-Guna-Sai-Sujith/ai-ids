import { useState } from 'react';
import { AttackType } from '../types';

interface AttackCardProps {
  attack: AttackType;
  isDetected: boolean;
  index: number;
}

const severityColors: Record<string, string> = {
  low: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30',
  medium: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
  high: 'from-red-500/20 to-red-600/5 border-red-500/30',
  critical: 'from-red-600/20 to-red-700/5 border-red-600/30',
};

const severityBadgeColors: Record<string, string> = {
  low: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  critical: 'bg-red-600/20 text-red-400 border-red-600/30',
};

function AttackIcon({ type, detected }: { type: string; detected: boolean }) {
  const color = detected ? '#ef4444' : '#3b82f6';
  const glow = detected ? '0 0 12px rgba(239,68,68,0.5)' : '0 0 8px rgba(59,130,246,0.3)';

  switch (type) {
    case 'ddos':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ filter: `drop-shadow(${glow})` }}>
          <path d="M20 4L6 14v12l14 10 14-10V14L20 4z" stroke={color} strokeWidth="2" fill={detected ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.1)'} />
          <path d="M14 18l4 4 8-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="32" cy="6" r="3" fill={color} opacity="0.6" />
          <circle cx="36" cy="10" r="2" fill={color} opacity="0.4" />
          <circle cx="28" cy="4" r="2" fill={color} opacity="0.4" />
        </svg>
      );
    case 'dos':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ filter: `drop-shadow(${glow})` }}>
          <rect x="8" y="12" width="24" height="16" rx="2" stroke={color} strokeWidth="2" fill={detected ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.1)'} />
          <path d="M14 18h12M14 22h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M24 12V8M16 12V8M20 12V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <circle cx="20" cy="30" r="2" fill={color} />
        </svg>
      );
    case 'brute-force':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ filter: `drop-shadow(${glow})` }}>
          <rect x="12" y="16" width="16" height="12" rx="2" stroke={color} strokeWidth="2" fill={detected ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.1)'} />
          <path d="M16 16V12a4 4 0 018 0v4" stroke={color} strokeWidth="2" />
          <circle cx="20" cy="22" r="2" fill={color} />
          <path d="M20 24v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M30 8l3 3-3 3M33 11h-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        </svg>
      );
    case 'bot':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ filter: `drop-shadow(${glow})` }}>
          <rect x="10" y="14" width="20" height="16" rx="3" stroke={color} strokeWidth="2" fill={detected ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.1)'} />
          <circle cx="16" cy="22" r="2" fill={color} />
          <circle cx="24" cy="22" r="2" fill={color} />
          <path d="M16 28h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M20 14V10M16 10h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="8" r="2" stroke={color} strokeWidth="1" opacity="0.5" />
          <circle cx="24" cy="8" r="2" stroke={color} strokeWidth="1" opacity="0.5" />
        </svg>
      );
    case 'port-scan':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ filter: `drop-shadow(${glow})` }}>
          <circle cx="20" cy="20" r="12" stroke={color} strokeWidth="2" fill={detected ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.1)'} />
          <circle cx="20" cy="20" r="6" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="20" cy="20" r="2" fill={color} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 20 + 8 * Math.cos(rad);
            const y1 = 20 + 8 * Math.sin(rad);
            const x2 = 20 + 12 * Math.cos(rad);
            const y2 = 20 + 12 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" opacity={0.5} />;
          })}
        </svg>
      );
    case 'web-attack':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ filter: `drop-shadow(${glow})` }}>
          <path d="M8 8h24v24H8z" stroke={color} strokeWidth="2" rx="2" fill={detected ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.1)'} />
          <path d="M12 14h16M12 18h10M12 22h14M12 26h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <path d="M26 24l4 4m0-4l-4 4" stroke={detected ? '#ef4444' : '#f59e0b'} strokeWidth="2" strokeLinecap="round" />
          <path d="M14 12h4v2h-4z" fill={color} opacity="0.6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AttackCard({ attack, isDetected, index }: AttackCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`group relative rounded-2xl border p-5 transition-all duration-500 cursor-pointer overflow-hidden
        ${isDetected
          ? `bg-gradient-to-br ${severityColors[attack.severity]} shadow-lg`
          : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600'
        }
        ${hovered ? 'scale-[1.02] -translate-y-1' : ''}
      `}
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background glow effect when detected */}
      {isDetected && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 animate-blink"
            style={{ backgroundColor: 'currentColor' }}
          />
          <div className="absolute w-full h-px bg-red-500/20 animate-scan-line" />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`transition-transform duration-300 ${hovered ? 'scale-110' : ''}`}>
            <AttackIcon type={attack.id} detected={isDetected} />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              isDetected
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-blink'
                : severityBadgeColors[attack.severity]
            }`}>
              {isDetected ? '⚠ DETECTED' : attack.severity.toUpperCase()}
            </span>
          </div>
        </div>

        <h3 className={`text-lg font-bold mb-1 transition-colors duration-300 ${
          isDetected ? 'text-red-400' : 'text-white group-hover:text-blue-400'
        }`}>
          {attack.name}
        </h3>
        <p className="text-xs text-blue-400/70 mb-2 font-mono">{attack.fullName}</p>
        <p className={`text-sm leading-relaxed transition-colors duration-300 ${
          isDetected ? 'text-slate-300' : 'text-slate-400'
        }`}>
          {attack.description}
        </p>

        {/* Status bar */}
        <div className="mt-3 h-1.5 bg-slate-900/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isDetected
                ? 'bg-gradient-to-r from-red-600 to-red-400'
                : 'bg-gradient-to-r from-blue-600 to-blue-400'
            }`}
            style={{ width: isDetected ? `${70 + Math.random() * 25}%` : `${10 + Math.random() * 20}%` }}
          />
        </div>
      </div>
    </div>
  );
}
